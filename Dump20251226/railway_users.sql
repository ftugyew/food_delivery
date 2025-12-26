-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: tramway.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','restaurant','admin','delivery','delivery_agent') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `restaurant_id` int DEFAULT NULL,
  `status` enum('pending','approved','rejected','active','inactive') DEFAULT 'approved',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Sravan','sravan@gmail.com',NULL,'$2b$10$vo9zL9FUjlVYIOQrrA7fM.buAOxjOqY8eWqTVzyyFfvylVHZ2m40u','customer','2025-12-02 16:25:08',NULL,'approved'),(2,'sravan','sravankumar64099@gmail.com',NULL,'$2b$10$4WeErvnEu.c5TVMbEZGdNu2EsfCYuN7H6WRb6E022Y7bVvwAAx6XW','customer','2025-12-02 19:28:07',NULL,'approved'),(3,'hemanth','hemanth@tindo.com',NULL,'$2b$10$czq0V.U6PojkUVAOuKfeMOPN1tPg3Mzy/FgNDdMO2wMeFA/CQWU9i','customer','2025-12-02 19:30:05',NULL,'approved'),(4,'sravan','srgfe@gmail.com',NULL,'$2b$10$NmMc0RedCk796/kID9QCxuuhXhvrMfYjhgOULC9fC29h4ZjYHlA3u','customer','2025-12-05 10:34:04',NULL,'approved'),(5,'Test User','newtest5@mail.com','9876543210','$2b$10$N2y39JJ.LgsZKh8K8b0VzushqTsBYJBAID8kHHFkB83Fm1rlyooSG','customer','2025-12-06 13:25:57',NULL,'approved'),(6,'sravan16','sravan16@gmail.com','7013213317','$2b$10$Xc6YrXVH5IOJaV2Ryz5L..Wc3EhSfa7ZtUZexRcaWBzfq3PC1bxZe','admin','2025-12-06 15:38:06',NULL,'approved'),(8,'Admin','admin@tindo.com','9999999999','$2a$10$MULzWEQPywIWhE35V/3VruJZ7Qe1zF0Y7ucxgU0Cmfv9exqXk4T1e','admin','2025-12-06 15:56:26',NULL,'approved'),(9,'sravan','sra@gmail.com','7893439113','$2b$10$e/R96EIkyPquJtbrGf07quV.5iBgwiZEkvVFn2kGwxk7cXy7OVfTu','customer','2025-12-06 18:19:24',NULL,'approved'),(10,'Gattumeedhi Hemanth','hemanthgattumeedhi691@gmail.com','6304264892','$2b$10$YEJ5y5QKVXOlQoC2q7KWd.6HvBW4V.dnwtsBpQoeThLxom1Ai.0j.','customer','2025-12-07 05:03:40',NULL,'approved'),(11,'sraban','sravanq@gmail.com','7013213317','$2b$10$8uwmUh9D0Ds4QGLdn3a8EOPO9I.iLzcVnI0atIK7AtKcm3AkQyAz6','delivery_agent','2025-12-07 05:06:10',NULL,'pending'),(12,'rahul','rahul123@gmail.com','9392681811','$2b$10$0BtDEXlV8Kp.WgM0avEFRuoDUJZv3PC21kdI4ZbOq1qeuX12d.zV2','customer','2025-12-07 06:37:48',NULL,'approved'),(13,'sravan16','sravan12@gmail.com','7013213317','$2b$10$MLLgj9YbBw4fBSkzb52V7.5Nw66JM26lWRo4qwtuxFRPD7tyyv8Ua','restaurant','2025-12-07 16:23:58',NULL,'approved'),(14,'sravan','sravan78@gmail.com','7013213317','$2b$10$KyljA6OTI0aKg3GTFghtEeJAS9P3/Zf7FI5VWQjfT2XxkEDGCwxka','customer','2025-12-07 17:43:16',NULL,'approved'),(15,'sravan','srava78@gmail.com','7893439113','$2b$10$php1UQKM5//YC25jh0eJMOaiRueBHeRdp2lQX8/dNaa28Z5.yFAe2','restaurant','2025-12-07 18:04:56',NULL,'approved'),(16,'sravan','sravan789@gmail.com','7013213317','$2b$10$5BE1y8zI8PfeYi3AyPU6r.Hl2vPf/6i1zYumfu1no3QbE4S5o2Bp6','restaurant','2025-12-08 14:50:03',NULL,'approved'),(17,'sravan','sravan1@gmail.com','7013213317','$2b$10$HQkgULkgt7CgVZd82l/iUOTDNcNQUrADvjIGuSga53ELelGXO5v1O','restaurant','2025-12-08 16:34:07',1,'approved'),(18,'sravan','sravan2@gmail.com','7013213317','$2b$10$Rx52zOSttErORHJ.z8HoT.nRa40I3VRAAqUnKkpGAA3HJXjdqvK1C','restaurant','2025-12-09 16:56:51',2,'approved'),(19,'sravan','sravan3@gmail.com','7013213317','$2b$10$Bdh6HwJPekE/GEqG3Ug9qenTKGMs74B14D63apztVTVagkjd2iU6a','restaurant','2025-12-09 17:32:28',3,'approved'),(20,'sravan','sravan4@gmail.com','7013213317','$2b$10$VohuS8aRsBJ9Gy3rnE.jtehTY6xY3oOHGDG76w05sFHgRoY.WnI32','restaurant','2025-12-09 17:49:59',4,'approved'),(21,'sravan','sravan5@gmail.com','7013213317','$2b$10$hbHyp3hgCTmpzoDP1egVRer2OLt01LoB.xIqTmr3K6mZfTrbtMUWq','restaurant','2025-12-10 06:17:42',5,'approved'),(22,'N.Sravan','sravan7@gmail.com','70132 13317','$2b$10$XQFR98522egh3I6GmB./beWagr8r9bTlkmYguayvxGaSq3vNkV2N2','restaurant','2025-12-16 15:51:37',6,'approved'),(23,'niharika','sadashivpet@gmail.com','701321331','$2b$10$D7J8W004nFefc.SXKhesq.MCcSjiZs9ZgddMybKqn/NBAbxb.CqTK','restaurant','2025-12-17 08:02:26',7,'approved'),(24,'sravan','sravan8@gmail.com','7013213317','$2b$10$Zue2KRkaWwzISscNA6wSPuJdifaUtZaCrCrdai8ZrvgURT2.AmGdu','restaurant','2025-12-17 09:17:41',8,'approved'),(25,'sravan','sravan9@gmail.com','701321331','$2b$10$SXSs1n1qitDCYT5csNERduvkd6SX7LCym1k9nVCX6Z9YhNoULok3q','restaurant','2025-12-18 05:27:14',9,'approved'),(26,'N.Sravan','sravan10@gmail.com','70132 13317','$2b$10$y.s1UyOcRfr4C333It1TDO9V9AGPtxMSPbXC5zxdzfdArVonldyI.','restaurant','2025-12-18 14:59:54',10,'approved'),(28,'N.Sravan','sravan13@gmail.com','70132 13317','$2b$10$MYDAsITBAyyr0RvKGEt6tOSh8iau7kcIiQLWUehN0AqR5jnNKyILO','delivery_agent','2025-12-20 16:33:56',NULL,'approved'),(29,'sravan','sravan20@gmail.com','7893439113','$2b$10$FG7ECVh4bDXOEI/FbTNwMObx59q/u8sCM8s8j10xJIC/Y0p3af8na','delivery_agent','2025-12-22 18:38:56',NULL,'approved'),(30,'sravan','sravan21@gmail.com','7893439113','$2b$10$ZxHYs6il91DrrSe0NJOrwuCAHQMob0W5IkGo.SxuGp9D5xkalydfO','customer','2025-12-22 18:51:53',NULL,'approved'),(31,'sravan','sravan22@gmail.com','7013213317','$2b$10$qWWWtM.dbCnQNepjGOvyKe.871U09upVAce60SVQ81H1SaExWPNMi','delivery_agent','2025-12-23 04:17:46',NULL,'approved'),(32,'Hemanth','hemanthgattumeedhi@gmail.com','6304264892','$2b$10$8OPKO0M6BGeZRiCTDIXNmO4Je5zL4Zb/IxabLFMmHDYOwPmeSJodm','customer','2025-12-26 10:07:15',NULL,'approved');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 19:33:30
