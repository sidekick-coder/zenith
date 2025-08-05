<script setup lang="ts">
import {
    ref,
    onMounted,
    watch
} from 'vue'
import Icon from '#client/components/Icon.vue'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle
} from '#client/components/ui/resizable'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '#client/components/ui/breadcrumb'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import { $t } from '#shared/lang.ts'

interface FileItem {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

interface TreeNode {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
    children?: TreeNode[]
    expanded?: boolean
    level?: number
}

interface DriveData {
    id: string
    metas: {
        name?: string
        description?: string
    }
}

const props = defineProps<{
    driveId: string
    pwd?: string
}>()

const currentPath = ref(props.pwd || '')
const driveData = ref<DriveData | null>(null)
const files = ref<FileItem[]>([])
const treeNodes = ref<TreeNode[]>([])
const expandedFolders = ref<Set<string>>(new Set())
const selectedFile = ref<FileItem | null>(null)
const selectedFolderContents = ref<FileItem[]>([])
const isLoading = ref(false)

async function loadDrive() {
    if (!props.driveId) return
    
    isLoading.value = true
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}`, { method: 'GET' }))
    
    if (error) {
        console.error('Failed to load drive:', error)
        isLoading.value = false
        return
    }
    
    driveData.value = response as DriveData
    isLoading.value = false
}

async function loadFiles() {
    if (!props.driveId) return
    
    isLoading.value = true
    
    // Load files from root directory first
    await loadDirectory('')
    
    isLoading.value = false
}

async function loadDirectory(folderPath: string) {
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: folderPath }
    }))
    
    if (error) {
        console.error('Failed to load directory:', error)
        return []
    }
    
    const directoryFiles = (response as FileItem[]) || []
    
    // Add files to the main files array if they're not already there
    directoryFiles.forEach(file => {
        if (!files.value.find(f => f.path === file.path)) {
            files.value.push(file)
        }
    })
    
    buildTree()
    return directoryFiles
}

async function loadDirectoryChildren(folderPath: string) {
    return await loadDirectory(folderPath)
}

function buildTree() {
    const nodeMap = new Map<string, TreeNode>()
    const rootNodes: TreeNode[] = []
    
    // Create nodes for all files
    files.value.forEach(file => {
        const node: TreeNode = {
            ...file,
            children: file.type === 'directory' ? [] : undefined,
            expanded: expandedFolders.value.has(file.path),
            level: 0
        }
        nodeMap.set(file.path, node)
    })
    
    // Build hierarchy by checking parent-child relationships
    files.value.forEach(file => {
        const node = nodeMap.get(file.path)!
        const pathParts = file.path.split('/')
        
        if (pathParts.length === 1) {
            // Root level file/folder
            rootNodes.push(node)
            node.level = 0
        } else {
            // Find the direct parent
            const parentPath = pathParts.slice(0, -1).join('/')
            const parent = nodeMap.get(parentPath)
            
            if (parent && parent.children) {
                parent.children.push(node)
                node.level = (parent.level || 0) + 1
            } else {
                // Parent not loaded yet, put in root for now
                rootNodes.push(node)
                node.level = 0
            }
        }
    })
    
    // Sort children by type (directories first) and then by name
    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1
            }
            return a.name.localeCompare(b.name)
        })
        nodes.forEach(node => {
            if (node.children) {
                sortNodes(node.children)
            }
        })
    }
    
    sortNodes(rootNodes)
    treeNodes.value = rootNodes
}

async function toggleFolder(node: TreeNode) {
    if (node.type !== 'directory') return
    
    const wasExpanded = expandedFolders.value.has(node.path)
    
    if (wasExpanded) {
        expandedFolders.value.delete(node.path)
        node.expanded = false
    } else {
        expandedFolders.value.add(node.path)
        node.expanded = true
        
        // Load directory contents if not already loaded
        if (node.children && node.children.length === 0) {
            await loadDirectoryChildren(node.path)
        }
    }
    
    buildTree()
}

function getFlatTreeNodes(nodes: TreeNode[] = treeNodes.value): TreeNode[] {
    const result: TreeNode[] = []
    
    function traverse(nodeList: TreeNode[]) {
        nodeList.forEach(node => {
            result.push(node)
            if (node.expanded && node.children) {
                traverse(node.children)
            }
        })
    }
    
    traverse(nodes)
    return result
}

function selectFile(file: FileItem | TreeNode) {
    selectedFile.value = file
    currentPath.value = file.path
    
    // If it's a directory, load its contents for preview
    if (file.type === 'directory') {
        loadFolderContents(file.path)
    } else {
        selectedFolderContents.value = []
    }
}

async function loadFolderContents(folderPath: string) {
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: folderPath }
    }))
    
    if (error) {
        console.error('Failed to load folder contents:', error)
        selectedFolderContents.value = []
        return
    }
    
    selectedFolderContents.value = (response as FileItem[]) || []
}

function getFileIcon(file: FileItem | TreeNode) {
    if (file.type === 'directory') return 'folder'

    const mimetype = file.metas.mimetype || ''

    if (mimetype.startsWith('image/')) return 'Image'
    if (mimetype.startsWith('video/')) return 'Video'
    if (mimetype.startsWith('audio/')) return 'Music'
    if (mimetype.includes('pdf')) return 'FileText'
    if (mimetype.includes('text')) return 'FileText'
    
    return 'file'
}

function getBreadcrumbs() {
    if (!currentPath.value) return []
    return currentPath.value.split('/')
}

function navigateToBreadcrumb(index: number) {
    const breadcrumbs = getBreadcrumbs()
    const newPath = breadcrumbs.slice(0, index + 1).join('/')
    currentPath.value = newPath
    selectedFile.value = null
    selectedFolderContents.value = []
    loadFiles()
}

watch(() => props.driveId, loadDrive, { immediate: true })
watch(() => props.pwd, (newPwd) => {
    currentPath.value = newPwd || ''
    loadFiles()
})

onMounted(() => {
    loadFiles()
})
</script>

<template>
    <div class="h-full border-2 rounded overflow-hidden border-border bg-background">
        <ResizablePanelGroup
            direction="horizontal"
            class="h-full"
        >
            <!-- Left Sidebar - File Tree -->
            <ResizablePanel
                :default-size="25"
                :min-size="15"
                :max-size="50"
            >
                <div class="bg-sidebar border-r border-sidebar-border flex flex-col h-full">
                    <!-- File List -->
                    <div class="flex-1 overflow-auto p-2">
                        <div
                            v-if="isLoading"
                            class="flex items-center justify-center py-8"
                        >
                            <div class="text-sidebar-foreground/70">
                                {{ $t('Loading...') }}
                            </div>
                        </div>

                        <div
                            v-else
                            class="space-y-1"
                        >
                            <div
                                v-for="node in getFlatTreeNodes()"
                                :key="node.path"
                                :class="[
                                    'w-full flex items-center gap-2 p-2 rounded text-left transition-colors',
                                    selectedFile?.path === node.path 
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                                        : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground'
                                ]"
                                :style="{ paddingLeft: `${8 + (node.level || 0) * 16}px` }"
                            >
                                <button
                                    v-if="node.type === 'directory'"
                                    class="flex items-center justify-center w-4 h-4 flex-shrink-0"
                                    @click="toggleFolder(node)"
                                >
                                    <Icon
                                        :name="node.expanded ? 'ChevronDown' : 'ChevronRight'"
                                        class="w-3 h-3"
                                    />
                                </button>
                                <div
                                    v-else
                                    class="w-4 h-4 flex-shrink-0"
                                />
                                
                                <button
                                    class="flex items-center gap-2 flex-1 min-w-0"
                                    @click="selectFile(node)"
                                >
                                    <Icon
                                        :name="getFileIcon(node)"
                                        class="w-4 h-4 flex-shrink-0"
                                    />
                                    <span class="truncate text-sm">{{ node.name }}</span>
                                </button>
                            </div>
                        </div>

                        <div
                            v-if="!isLoading && files.length === 0"
                            class="text-center py-8 text-sidebar-foreground/70"
                        >
                            {{ $t('No files found') }}
                        </div>
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle with-handle />

            <!-- Right Panel - Preview -->
            <ResizablePanel :default-size="75">
                <div class="flex flex-col bg-background h-full">
                    <!-- Breadcrumb Navigation -->
                    <div class="p-4 border-b border-border">                        
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as="button"
                                        class="flex items-center gap-x-2"
                                        @click="currentPath = ''; selectedFile = null; selectedFolderContents = []; loadFiles()"
                                    >
                                        <Icon
                                            name="folder"
                                            class="size-4 mr-1"
                                        />
                                        <div>Root</div>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                
                                <template
                                    v-for="(part, index) in getBreadcrumbs()"
                                    :key="index"
                                >
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            v-if="index < getBreadcrumbs().length - 1"
                                            as="button"
                                            @click="navigateToBreadcrumb(index)"
                                        >
                                            {{ part }}
                                        </BreadcrumbLink>
                                        <BreadcrumbPage v-else>
                                            {{ part }}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </template>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <!-- Preview Content -->
                    <div class="flex-1 p-4 overflow-auto">
                        <div
                            v-if="!selectedFile"
                            class="flex items-center justify-center h-full text-muted-foreground"
                        >
                            <div class="text-center">
                                <Icon
                                    name="file"
                                    class="w-12 h-12 mx-auto mb-4 opacity-50"
                                />
                                <p>{{ $t('Select a file or folder to see its preview') }}</p>
                            </div>
                        </div>

                        <div
                            v-else
                            class="space-y-4"
                        >
                            <!-- File Info -->
                            <div class="bg-card border border-border rounded-lg p-4">
                                <div class="flex items-center gap-3 mb-3">
                                    <Icon
                                        :name="getFileIcon(selectedFile)"
                                        class="w-6 h-6"
                                    />
                                    <div>
                                        <h4 class="font-medium">
                                            {{ selectedFile.path }}
                                        </h4>
                                        <p class="text-sm text-muted-foreground">
                                            {{ selectedFile.metas.mimetype }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Directory Contents Preview -->
                            <div
                                v-if="selectedFile.type === 'directory'"
                                class="bg-card border border-border rounded-lg p-4"
                            >
                                <h5 class="font-medium mb-3">
                                    {{ $t('Directory Contents') }}
                                </h5>
                                <div
                                    v-if="selectedFolderContents.length === 0"
                                    class="text-sm text-muted-foreground text-center py-4"
                                >
                                    {{ $t('This directory is empty') }}
                                </div>
                                <div
                                    v-else
                                    class="space-y-2"
                                >
                                    <div
                                        v-for="item in selectedFolderContents"
                                        :key="item.path"
                                        class="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                        @click="selectFile(item)"
                                    >
                                        <Icon
                                            :name="getFileIcon(item)"
                                            class="w-4 h-4 flex-shrink-0"
                                        />
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium truncate">
                                                {{ item.name }}
                                            </p>
                                            <p class="text-xs text-muted-foreground">
                                                {{ item.type === 'directory' ? $t('Directory') : item.metas.mimetype }}
                                            </p>
                                        </div>
                                        <div class="text-xs text-muted-foreground">
                                            {{ item.type === 'file' && item.metas.size ? `${Math.round(item.metas.size / 1024)} KB` : '' }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- File Preview Placeholder -->
                            <div
                                v-else
                                class="bg-card border border-border rounded-lg p-4"
                            >
                                <h5 class="font-medium mb-3">
                                    {{ $t('File Details') }}
                                </h5>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">{{ $t('Type:') }}</span>
                                        <span>{{ selectedFile.metas.mimetype }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">{{ $t('Name:') }}</span>
                                        <span>{{ selectedFile.path }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
</template>

