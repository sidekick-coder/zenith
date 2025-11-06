# Install Zenith using Docker compose

To install Zenith using Docker compose, follow these steps:

1. **Create a compose file**: Create a `docker-compose.yml` file with the following content:

```yml
services:
    app:
        image: zzhenryquezz/zenith:tag
        restart: unless-stopped
        ports:
            - 3000:3000
        volumes:
            - .volumes/app/modules:/app/modules
            - .volumes/app/storage:/app/storage
```

2. **Run Docker compose**: Use the following command to start the Zenith application using Docker compose:

```sh
docker-compose up -d
```

3. **Access the Application**: Open your web browser and navigate to `http://localhost:3000` to access the Zenith application and begin the setup.