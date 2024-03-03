document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const qrForm = document.getElementById("qrForm");
    const historyContainer = document.getElementById("historyContainer");

    function handleResponse(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }

    function getToken() {
        return sessionStorage.getItem("token");
    }

    function setToken(token) {
        sessionStorage.setItem("token", token);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            fetch("/user/login", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password")
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(handleResponse)
                .then(data => {
                    if (data.token) {
                        setToken(data.token);
                        window.location.href = "/dashboard";
                    } else {
                        alert("Login failed");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred during login.");
                });
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            fetch("/user/register", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password")
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(handleResponse)
                .then(data => {
                    alert("Registration successful");
                    window.location.href = "/user/login";
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred during registration.");
                });
        });
    }

    if (qrForm) {
        qrForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(qrForm);
            const token = getToken();
            if (!token) {
                alert('You are not logged in.');
                return;
            }
            fetch("/qr/generate", {
                method: "POST",
                body: JSON.stringify({ content: formData.get("content") }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(handleResponse)
                .then(data => {
                    const img = document.createElement("img");
                    img.src = data.imagePath;
                    document.getElementById("qrResult").appendChild(img);
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred while generating the QR code.");
                });
        });
    }

    if (historyContainer) {
        const token = getToken();
        if (!token) {
            alert('You are not logged in.');
            return;
        }
        fetch("/qr", {
            headers: {
                "Authorization": "Bearer " + token
            }
        })
            .then(handleResponse)
            .then(data => {
                data.forEach(qr => {
                    const img = document.createElement("img");
                    img.src = qr.imagePath;
                    historyContainer.appendChild(img);
                });
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while loading QR history.");
            });
    }
});