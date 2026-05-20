<?php
session_start();
require_once __DIR__ . "/../config/db.php";
function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}
function finish_add_event($success, $message, $event_id = null, $image_name = null)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "event_id" => $event_id,
            "image_name" => $image_name
        ]);
        exit();
    }
    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}
if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin") {
    http_response_code(403);
    finish_add_event(false, "Access denied.");
}
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_add_event(false, "Invalid request.");
}
$name = trim($_POST["name"] ?? "");
$date = $_POST["date"] ?? "";
$location = trim($_POST["location"] ?? "");
$category = trim($_POST["category"] ?? "");
$description = trim($_POST["description"] ?? "");
if ($name === "" || $date === "" || $location === "" || $category === "") {
    finish_add_event(false, "Please fill all required fields.");
}
$imageName = null;
if (isset($_FILES['image'])) {
    if ($_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES['image']['tmp_name'];
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $mime = mime_content_type($tmpName);
        if (!in_array($mime, $allowedMimeTypes)) {
            finish_add_event(false, "Sorry, only image files are allowed (JPEG, PNG, GIF, WEBP).");
        } else {
            $imageName = time() . '_' . basename($_FILES['image']['name']);
            $uploadDir = __DIR__ . "/../images/events/";
            
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            if (!move_uploaded_file($tmpName, $uploadDir . $imageName)) {
                finish_add_event(false, "An error occurred while saving the image to the directory.");
            }
        }
    } elseif ($_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        finish_add_event(false, "Image upload failed. It might exceed the maximum allowed size. Error code: " . $_FILES['image']['error']);
    }
}
$stmt = $pdo->prepare("
    INSERT INTO events (title, date, location, category, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->execute([$name, $date, $location, $category, $description, $imageName]);
finish_add_event(true, "Event added successfully.", $pdo->lastInsertId(), $imageName);
?>
