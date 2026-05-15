<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'user') {
    echo json_encode(["success" => false, "message" => "You must be logged in as a student to register."]);
    exit();
}
$event_id = $_POST['event_id'] ?? '';
$student_id = $_SESSION['student_id'] ?? '';
if (!$event_id) {
    echo json_encode(["success" => false, "message" => "Invalid event."]);
    exit();
}
try {
    $check = $pdo->prepare("SELECT id FROM registrations WHERE student_id = ? AND event_id = ?");
    $check->execute([$student_id, $event_id]);
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "You are already registered for this event."]);
        exit();
    }
    $stmt = $pdo->prepare("INSERT INTO registrations (student_id, event_id, registration_date, status) VALUES (?, ?, NOW(), 'registered')");
    $stmt->execute([$student_id, $event_id]);
    echo json_encode(["success" => true, "message" => "Registration successful!"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>