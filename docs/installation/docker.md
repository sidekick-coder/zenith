# Install Zenith using Docker

To install Zenith using Docker, follow these steps:

1. **Create Persistent Storage Volumes**: Create Docker volumes to persist data such as configuration and uploaded files:

```sh
docker volume create zenith-storage # config files and uploads
docker volume create zenith-modules # modules installled
```

2. **Run the Docker Container**: Use the following command to pull and run the Zenith Docker container:

```sh
docker run -d \
    -p 3000:3000 \ 
    --name zenith \
    -v zenith-storage:/app/storage \
    -v zenith-modules:/app/modules \
    sidekickcoder/zenith:latest
```

3. **Access the Application**: Open your web browser and navigate to `http://localhost:3000` to access the Zenith application and begin the setup.