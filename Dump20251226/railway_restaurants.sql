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
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT '',
  `image_url` varchar(500) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '4.5',
  `opening_time` varchar(20) DEFAULT NULL,
  `closing_time` varchar(20) DEFAULT NULL,
  `cuisine` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected','active','inactive') DEFAULT 'approved',
  `eta` int DEFAULT '30',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `is_top` tinyint(1) DEFAULT '0',
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'udupi','','1765211646544-800567376.jpeg',4.0,NULL,NULL,'Multi Cuisine','nice','2025-12-08 16:34:07','approved',30,17.49496680,78.60798040,0,1,0,17.49496680,78.60798040),(2,'bawarchi','','1765299411105-584331196.jpeg',5.0,NULL,NULL,'Multi Cuisine','nice','2025-12-09 16:56:51','approved',30,NULL,NULL,0,0,0,NULL,NULL),(3,'paradise','','1765301548290-268696806.jpeg',4.5,NULL,NULL,'Multi Cuisine','good taste','2025-12-09 17:32:28','pending',30,NULL,NULL,0,0,0,NULL,NULL),(4,'havisa','','1765302598694-309825881.jpeg',4.5,NULL,NULL,'Multi Cuisine','nice','2025-12-09 17:49:59','approved',30,NULL,NULL,0,0,0,NULL,NULL),(5,'telangana ruchulu','','1765347461539-710753539.png',4.5,NULL,NULL,'Multi Cuisine','nice','2025-12-10 06:17:42','pending',30,NULL,NULL,0,0,0,NULL,NULL),(6,'pista house','','1765900296449-815163991.jpg',4.0,NULL,NULL,'Multi Cuisine','nice','2025-12-16 15:51:37','approved',30,NULL,NULL,0,1,1,NULL,NULL),(7,'nakshartra','','1765958545724-530536455.jpeg',4.5,NULL,NULL,'Multi Cuisine','spicy food','2025-12-17 08:02:26','pending',30,NULL,NULL,0,0,0,NULL,NULL),(8,'samskruthi','','1765963060597-531811565.jpeg',4.5,NULL,NULL,'Multi Cuisine','nice taste','2025-12-17 09:17:41','approved',15,NULL,NULL,0,0,0,NULL,NULL),(9,'cse hotel','','https://image2url.com/images/1766072146763-e733612a-dce3-4c93-8d2d-dbe441af0248.jpeg',4.0,NULL,NULL,'Multi Cuisine','nuve','2025-12-18 05:27:14','approved',30,NULL,NULL,0,0,0,NULL,NULL),(10,'ratna','','https://image2url.com/images/1766072146763-e733612a-dce3-4c93-8d2d-dbe441af0248.jpeg',5.0,NULL,NULL,'Multi Cuisine','kjbh','2025-12-18 14:59:54','approved',30,NULL,NULL,0,0,0,NULL,NULL);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 19:33:19
