<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['role'])) {
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}
require_once __DIR__ . '/../config/db.php';
$action = $_POST['action'] ?? '';
if ($action === 'delete') {
    if ($_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Access denied.']);
        exit;
    }
    $student_id = $_POST['student_id'] ?? '';
    if (empty($student_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing user identifier.']);
        exit;
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM users WHERE student_id = ?');
        $stmt->execute([$student_id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}
$is_admin = ($_SESSION['role'] === 'admin');
$student_id = $is_admin ? ($_POST['student_id'] ?? '') : $_SESSION['student_id'];
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$major = $_POST['major'] ?? '';
$dob = $_POST['date_of_birth'] ?? '';
$password = $_POST['password'] ?? '';
if (empty($student_id) || empty($name) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}
try {
    $updates = ["name = ?", "email = ?", "major = ?"];
    $params = [$name, $email, $major];
    if (!empty($dob)) { $updates[] = "date_of_birth = ?"; $params[] = $dob; }
    if (!empty($password)) { $updates[] = "password = ?"; $params[] = password_hash($password, PASSWORD_DEFAULT); }
    $params[] = $student_id;
    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE student_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    if (!$is_admin) { $_SESSION['user_name'] = $name; } // تحديث اسم الطالب في الموقع
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>