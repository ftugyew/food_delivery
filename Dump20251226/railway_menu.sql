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
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `is_veg` tinyint(1) DEFAULT '1',
  `image_url` varchar(500) DEFAULT NULL,
  `restaurant_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu`
--

LOCK TABLES `menu` WRITE;
/*!40000 ALTER TABLE `menu` DISABLE KEYS */;
INSERT INTO `menu` VALUES (3,'biryani',899.00,'ndd','Biryani',0,'1765302840639-433658807.jpg',4,'2025-12-17 16:15:01'),(10,'biryani',499.00,'spicy','Biryani',1,'menu/1765963274227.jpeg',8,'2025-12-17 16:15:01'),(13,'mklre',544.00,'kjdc','Biryani',1,'menu/1765981167127.jpg',1,'2025-12-17 16:15:01'),(14,'biryani',560.00,'cfe','Biryani',0,'1765988738647-868624574.jpg',6,'2025-12-17 16:25:38'),(15,'shewarma',560.00,'tdrgh','Starters',0,'1765990037661-826594946.jpg',6,'2025-12-17 16:47:17'),(16,'shewarma',560.00,'hks','Starters',0,'1765990659607-247734948.jpg',6,'2025-12-17 16:57:39'),(17,'shewarma',560.00,'jhk','Starters',0,'1765991437668-209759663.jpg',6,'2025-12-17 17:10:37'),(18,'idli',89.00,'vg','Other',0,'1765993744301-20325497.jpg',6,'2025-12-17 17:49:04'),(19,'biryani',455.00,'spicy','Biryani',0,'1766035771596-305381920.jpeg',9,'2025-12-18 05:29:31'),(20,'grfc',54.00,'tgvr','Desserts',0,'1766070354976-395836699.jpg',10,'2025-12-18 15:05:55'),(21,'vgrfc',54.00,'htvgr','Biryani',0,'1766070878934-491422930.jpg',10,'2025-12-18 15:14:39'),(22,'idli',89.00,'gvtr','Starters',1,NULL,10,'2025-12-18 15:20:30'),(23,'idli',894.00,'gb f','Desserts',1,'1766071804325-616904610.jpg',10,'2025-12-18 15:30:04');
/*!40000 ALTER TABLE `menu` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 19:33:38
