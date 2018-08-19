# DB

## jpa使用oracle和mysql区别

* MYSQL有id自增，ORACLE没有，需要使用序列
* user在oracle的关键字，不能使用作为表名。
* ORACLE没有@Longtext类型，需要使用@Clob
* @Clob：大文本，@Blob：二进制