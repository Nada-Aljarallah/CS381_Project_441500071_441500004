<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}
require_once __DIR__ . '/../config/db.php';
$id = $_POST['id'] ?? $_POST['event_id'] ?? '';
$name = $_POST['name'] ?? $_POST['title'] ?? '';
$date = $_POST['date'] ?? '';
$location = $_POST['location'] ?? '';
$category = $_POST['category'] ?? '';
$description = $_POST['description'] ?? '';
$email = $_POST['email'] ?? '';
if (empty($id) || empty($name) || empty($date)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}
try {
    $updates = ["title = ?", "date = ?", "location = ?", "category = ?", "description = ?", "email = ?"];
    $params = [$name, $date, $location, $category, $description, $email];

    $imageField = isset($_FILES['event_image']) ? 'event_image' : 'image';
    if (isset($_FILES[$imageField]) && $_FILES[$imageField]['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../images/events/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES[$imageField]['name']));
        $targetFilePath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES[$imageField]['tmp_name'], $targetFilePath)) {
            $updates[] = "image = ?"; // Ensure database column is named 'image'
            $params[] = $fileName;
        }
    }

    $params[] = $id;
    $sql = "UPDATE events SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>