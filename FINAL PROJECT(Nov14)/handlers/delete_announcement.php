<?php
require_once '../config/database.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['announcement_id'])) {
    try {
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE announcement_id = ? AND admin_account_number = ?");
        $stmt->execute([
            $_POST['announcement_id'],
            $_SESSION['admin_id']
        ]);
        
        echo json_encode(['success' => true]);
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?> 