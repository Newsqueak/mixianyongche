/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50096
Source Host           : localhost:3306
Source Database       : elong_iflight

Target Server Type    : MYSQL
Target Server Version : 50096
File Encoding         : 65001

Date: 2015-02-16 17:57:14
*/
use mytest;
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Records of airline
-- ----------------------------

-- ----------------------------
-- Table structure for `flight`
-- ----------------------------
DROP TABLE IF EXISTS `flight`;
CREATE TABLE `flight` (
  `id` int(11) NOT NULL auto_increment COMMENT 'ID',
  `airline` varchar(100) default NULL COMMENT '航线',
  `flightNo` varchar(20) default NULL COMMENT '航班号',
  `depAirportCode` varchar(10) default NULL COMMENT '起飞机场三字码',
  `depCityName` varchar(50) default NULL COMMENT '起飞城市名称',
  `depAirport` varchar(50) default NULL COMMENT '起飞机场',
  `arrAirportCode` varchar(10) default NULL COMMENT '达到机场三字码',
  `arrCityName` varchar(50) default NULL COMMENT '达到城市名称',
  `arrAirport` varchar(50) default NULL COMMENT '到达机场',
  `depTime` varchar(50) default NULL COMMENT '起飞时间',
  `arrTime` varchar(50) default NULL COMMENT '降落时间',
  `flightTime` varchar(50) default NULL COMMENT '飞行时长',
  `planeModel` varchar(50) default NULL COMMENT '机型',
  `airlineCompany` varchar(200) default '航空公司',
  `savetime` datetime default NULL,
  PRIMARY KEY (`id`),
  INDEX `flightNoIndex` (`flightNo`(8)),
  INDEX `depTimeIndex` (`depTime`(10)),
  INDEX `arrTimeIndex` (`arrTime`(10))
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='flight stored in here';

-- ----------------------------
-- Records of airline_transfer
-- ----------------------------


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` char(20) NOT NULL DEFAULT '' COMMENT 'ID',
  `entire_phone` char(30) NOT NULL DEFAULT '' COMMENT '像86)15810865639',
  `orig_sec` varchar(50) DEFAULT NULL COMMENT '原密',
  `hashed_sec` varchar(200) DEFAULT NULL COMMENT '哈希密',
  `avatar_url` varchar(100) DEFAULT NULL COMMENT '头像图片网址',
  `screen_name` varchar(30) DEFAULT NULL COMMENT '用户昵称',
  `official_name` varchar(30) DEFAULT NULL COMMENT '用户护照英文姓名',
  `gender` char(1) DEFAULT NULL,
  `birthday` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL, 
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entire_phone_uk` (`entire_phone`)
)  ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='InnoDB free: 4096 kB';



DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` int(11) NOT NULL auto_increment,
  `uid` char(20) NOT NULL DEFAULT '',
  `ua` varchar(300) DEFAULT NULL,
  `mobileId` varchar(100) DEFAULT NULL,
  `thisTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `sessionUidIndex` (`uid`),
  INDEX `sessionMobileIdIndex` (`mobileId`)
) ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='InnoDB free: 4096 kB';


DROP TABLE IF EXISTS `member_points`;
CREATE TABLE `member_points` (
  `uid` char(20) NOT NULL DEFAULT '',
  `basicPoints` int(11) NOT NULL DEFAULT 0,
  `additionPoints` int(11) NOT NULL DEFAULT 0,
  `thisTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='InnoDB free: 4096 kB';


DROP TABLE IF EXISTS `charges_log`;
CREATE TABLE `charges_log` (
  `charge_id` char(30) NOT NULL DEFAULT '',
  `order_no` char(15) NOT NULL DEFAULT '',
  `charge` text DEFAULT NULL,
  `thisTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`charge_id`),
  UNIQUE KEY `charges_order_no_uk` (`order_no`)
) ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='InnoDB free: 4096 kB';



DROP TABLE IF EXISTS `prices_archive`;
CREATE TABLE `prices_archive` (
  `id` int(11) NOT NULL auto_increment,
  `pid` char(20) NOT NULL DEFAULT '',
  `unit_price` double DEFAULT 0.0,
  `unit_cost` double DEFAULT 0.0,
  `beginTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `thisTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='archive for product prices';


DROP TABLE IF EXISTS `airports`;
CREATE TABLE `airports` (
  `IATA` varchar(6) NOT NULL DEFAULT '',
  `airport_name` varchar(100) NOT NULL DEFAULT '',
  `airport_name_en` varchar(100) DEFAULT NULL,
  `belong_city` varchar(100) NOT NULL DEFAULT '',
  `belong_city_en` varchar(100) DEFAULT NULL,
  `belong_country` varchar(50) NOT NULL DEFAULT '',
  `phone_code` varchar(10) DEFAULT NULL,
  `status` char(1) DEFAULT NULL,
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`IATA`),
  INDEX `airportsNameIndex` (`airport_name`)
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='airports IATA';




DROP TABLE IF EXISTS `location`;
CREATE TABLE `location` (
  `id` char(20) NOT NULL DEFAULT '',
  `place_name` varchar(300) NOT NULL DEFAULT '',
  `place_name_en` varchar(300) NOT NULL DEFAULT '',
  `place_type` varchar(50) DEFAULT NULL,
  `city` varchar(100) NOT NULL DEFAULT '',
  `country` varchar(100) NOT NULL DEFAULT '',
  `transliteration` varchar(300) NOT NULL DEFAULT '',
  `region` varchar(100) NOT NULL DEFAULT '',
  `a1` varchar(100) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `locationCityIndex` (`city`)
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='locations such as XXX hotel';





DROP TABLE IF EXISTS `car`;
CREATE TABLE `car` (
  `id` varchar(200) NOT NULL DEFAULT '',
  `car_desc` varchar(100) NOT NULL DEFAULT '',
  `car_level` varchar(6) NOT NULL DEFAULT '',
  `level_class` varchar(50) DEFAULT NULL,
  `pic_url` varchar(100) DEFAULT NULL,
  `airportCity` varchar(100) NOT NULL DEFAULT '',
  `remarks` varchar(500) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `carCityIndex` (`airportCity`)
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='car details';





DROP TABLE IF EXISTS `transfer_products`;
CREATE TABLE `transfer_products` (
  `id` char(20) NOT NULL DEFAULT '',
  `airportCity` varchar(100) NOT NULL DEFAULT '',
  `service_type` char(1) DEFAULT NULL,
  `fromRegion` varchar(100) NOT NULL DEFAULT '',
  `toRegion` varchar(100) NOT NULL DEFAULT '',
  `periodBegin` double DEFAULT 0.0,
  `periodEnd` double DEFAULT 24.0,
  `car_id` varchar(200) NOT NULL DEFAULT '',
  `unit_price` double DEFAULT 0.0,
  `currency` varchar(10) NOT NULL DEFAULT 'CNY',
  `free_service` varchar(500) DEFAULT NULL,
  `paid_service` varchar(500) DEFAULT NULL,
  `travel_distance` double DEFAULT 50.0,
  `take_time` double DEFAULT 50.0,
  `dailyCapacity` int(11) NOT NULL DEFAULT 20,
  `yc_hours_ahead` int(3) DEFAULT 0,
  `min_person_count` int(3) NOT NULL DEFAULT 1,
  `person_count` int(3) NOT NULL DEFAULT 3,
  `small_bag_count` int(2) NOT NULL DEFAULT 3,
  `small_bag_size` varchar(50) DEFAULT NULL,
  `big_bag_count` int(2) NOT NULL DEFAULT 1,
  `big_bag_size` varchar(50) DEFAULT NULL,
  `dateFrom` datetime DEFAULT NULL,
  `dateTo` datetime DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `productMixIndex` (`airportCity`, `service_type`, `fromRegion`, `toRegion`)
) ENGINE=MyISAM
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='product menu';




DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_no` char(20) NOT NULL DEFAULT '',
  `charge_id` char(30) NOT NULL DEFAULT '',
  `uid` char(20) NOT NULL DEFAULT '-',
  `mobileId` varchar(100) NOT NULL DEFAULT '',
  `ua` varchar(200) NOT NULL DEFAULT '',
  `pay_status` varchar(5) NOT NULL DEFAULT '0',
  `pay_channel` varchar(20) DEFAULT NULL,
  `build_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `book_date` varchar(15) NOT NULL DEFAULT '',
  `flight_no` varchar(15) NOT NULL DEFAULT '',
  `product_id` char(20) NOT NULL DEFAULT '',
  `place_id` char(20) NOT NULL DEFAULT '',
  `service_type` char(1) DEFAULT NULL,
  `start_place` varchar(100) DEFAULT NULL,
  `end_place` varchar(100) DEFAULT NULL,
  `yc_country` varchar(100) DEFAULT NULL,
  `yc_city` varchar(100) DEFAULT NULL,
  `yc_time` varchar(100) DEFAULT NULL,
  `yc_provider` varchar(100) DEFAULT NULL,
  `order_username` varchar(100) DEFAULT NULL,
  `order_phone` varchar(100) DEFAULT NULL,
  `order_country_code` varchar(10) DEFAULT NULL,
  `order_email` varchar(100) DEFAULT NULL,
  `pickup_card_name` varchar(100) DEFAULT NULL,
  `order_phone_abroad` varchar(100) DEFAULT NULL,
  `car_level_desc` varchar(100) DEFAULT NULL,
  `car_count` int(11) DEFAULT 1,
  `adult_count` int(11) DEFAULT 1,
  `child_count` int(11) DEFAULT 0,
  `baby_count` int(11) DEFAULT 0,
  `unit_price` double DEFAULT 0.0,
  `total_price` double DEFAULT 0.0,
  `unit_cost` double DEFAULT 0.0,
  `total_cost` double DEFAULT 0.0,
  `service_tel_abroad` varchar(100) DEFAULT NULL,
  `is_damage` char(1) DEFAULT NULL COMMENT '赔付',
  `prov_tran_no` varchar(100) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `a2` varchar(100) DEFAULT NULL,
  `a3` varchar(100) DEFAULT NULL,
  `a4` varchar(100) DEFAULT NULL,
  `a5` varchar(100) DEFAULT NULL,
  `a6` varchar(100) DEFAULT NULL,
  `a7` varchar(100) DEFAULT NULL,
  `a8` varchar(100) DEFAULT NULL,
  `a9` varchar(100) DEFAULT NULL,
  `a10` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`order_no`),
  INDEX `orderUidIndex` (`uid`),
  INDEX `orderMobidIndex` (`mobileId`)
) ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='orders from weixin and apps';



DROP TABLE IF EXISTS `daily_yc_count`;
CREATE TABLE `daily_yc_count` (
  `car_desc` varchar(100) NOT NULL DEFAULT '',
  `yc_date` varchar(15) NOT NULL DEFAULT '',
  `yc_city` varchar(100) NOT NULL DEFAULT '',
  `yc_count` int(11) DEFAULT 0,
  PRIMARY KEY (`car_desc`, `yc_date`, `yc_city`)
) ENGINE=InnoDB
AUTO_INCREMENT=1 DEFAULT CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'
COMMENT='some car using number per day in a city';




