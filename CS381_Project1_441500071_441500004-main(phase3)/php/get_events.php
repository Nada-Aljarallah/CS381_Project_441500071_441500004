<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
try {
    $stmt = $pdo->query("SELECT id, title, date, location, category, description, image FROM events ORDER BY date ASC");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($events as &$event) {
        if (!empty($event['image'])) {
            $event['image_path'] = '../images/events/' . $event['image'];
        } else {
            $event['image_path'] = null; 
        }
    }
    echo json_encode($events);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>