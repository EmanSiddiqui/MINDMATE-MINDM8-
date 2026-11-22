# Simple backend explanation for viva

- `Assessment` class: stores ten integer answers in an array, reverses positive-question scoring, calculates averages, and creates a JSON response.
- `WebServer` class: uses Windows Winsock to serve HTML/CSS/JS/JSON files and process a POST request.
- `main()`: creates a `WebServer` object and calls `run()`.
- Array: `int answers[10]` and simple loops. No trees, queues, databases, AI models or complex algorithms.
- Browser JS handles local record storage, history and charts. C++ handles the assessment calculation.
