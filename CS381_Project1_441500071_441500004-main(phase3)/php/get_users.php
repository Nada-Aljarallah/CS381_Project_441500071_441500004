<?php
session_start();
require_once __DIR__ . "/../config/db.php";
header("Content-Type: application/json");
try {
    $stmt = $pdo->query("SELECT student_id AS studentId, name, email, major FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} catch (PDOException $e) {
    echo json_encode([]);
}
?>