<?php
session_start();
header('Content-Type: application/json');
if (isset($_SESSION['student_id'])) {
    require_once __DIR__ . '/../config/db.php';
    try {
        $stmt = $pdo->prepare("SELECT student_id AS studentId, name, email, major, date_of_birth, role FROM users WHERE student_id = ?");
        $stmt->execute([$_SESSION['student_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            if (empty($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
            echo json_encode(['success' => true, 'user' => $user, 'csrf_token' => $_SESSION['csrf_token']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found in database.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
}
?>