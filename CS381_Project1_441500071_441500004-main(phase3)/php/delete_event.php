<?php
session_start();
include("../config/db.php");
$is_ajax = strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";

header("Content-Type: application/json");

/* Allow only admin */
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    if ($is_ajax) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access denied."
        ]);
        exit();
    }
    echo json_encode(["success" => false, "message" => "Access denied."]);
    exit();
}

/* Check CSRF Token */
$csrf_token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf_token)) {
    if ($is_ajax) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "CSRF token validation failed."
        ]);
        exit();
    }
    echo json_encode(["success" => false, "message" => "CSRF token validation failed."]);
    exit();
}

/* Check event id */
if (!isset($_POST['id'])) {
    if ($is_ajax) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "No event selected."
        ]);
        exit();
    }
    echo json_encode(["success" => false, "message" => "No event selected."]);
    exit();
}
$event_id = $_POST['id'];

try {
    /* Get image name to delete the file */
    $stmt = $pdo->prepare("SELECT image FROM events WHERE id = ?");
    $stmt->execute([$event_id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($event && !empty($event['image'])) {
        $imagePath = __DIR__ . "/../images/events/" . $event['image'];
        if (file_exists($imagePath)) {
            @unlink($imagePath); // Added @ to suppress warnings that break JSON
        }
    }
    $pdo->prepare("DELETE FROM registrations WHERE event_id = ?")
        ->execute([$event_id]);
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$event_id]);
    if ($is_ajax) {
        echo json_encode(["success" => true]);
        exit();
    }
    header("Location: ../pages/admin.html");
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    exit();
}
?>
