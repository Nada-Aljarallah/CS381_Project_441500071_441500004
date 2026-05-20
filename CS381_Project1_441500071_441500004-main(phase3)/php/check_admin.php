<?php
session_start();
header("Content-Type: application/json");
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    echo json_encode(["success" => true, "is_admin" => true, "csrf_token" => $_SESSION['csrf_token']]);
} else {
    echo json_encode(["success" => true, "is_admin" => false]);
}
?>