import app from "./app";

const port = process.env.PORT || 5000;

const bootstrap = () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
};

bootstrap();
