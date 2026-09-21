# CareerForge: একবার setup, তারপর এক click-এ run

## প্রতিদিন project চালানোর নিয়ম

`F:\AOOP\Start-CareerForge.bat`-এ double-click করো।

এটি MySQL, backend এবং frontend চালাবে এবং browser-এ `http://localhost:5174` খুলবে। API এবং Frontend নামের দুইটি কালো window খোলা রাখতে হবে। Project বন্ধ করতে দুই window-তেই `Ctrl + C` চাপো।

## শুধু প্রথমবারের setup

1. **Java 17 JDK**, **Node.js LTS** এবং **MySQL 8** (অথবা XAMPP-এর MySQL) install করো।
2. MySQL চালু করো এবং `careerforge` database তৈরি/import করো। XAMPP হলে XAMPP Control Panel থেকে শুধু **MySQL Start** দিলেই হবে।
3. Project folder-এ PowerShell খুলে নিচের command চালাও:

```powershell
Get-Content database\careerforge.sql | mysql -u root -p
```

4. এই project-এর latest community moderation feature-এর জন্য একবার নিচের migration চালাও। নতুন database import করলেও এই command লাগবে।

```powershell
Get-Content database\upgrade-community-moderation.sql | mysql -u root -p careerforge
```

ভবিষ্যতে GitHub থেকে pull করার পর `database` folder-এ নতুন `upgrade-*.sql` থাকলে README-তে বলা migration-টিও একবার run করবে।

5. `.env.example` copy করে `.env` বানাও, তারপর নিজের MySQL password বসাও। অন্য API key না দিলেও basic project চলবে।

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env`-এ দরকার হলে এই values দাও:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=careerforge
DB_USERNAME=root
DB_PASSWORD=তোমার_mysql_password
```

6. আবার `Start-CareerForge.bat` double-click করো। প্রথমবার launcher Maven ও frontend packages নামাতে পারে; Internet চালু রাখবে। পরে আর এই download লাগবে না।

## সমস্যা হলে দ্রুত check

- **MySQL could not start**: XAMPP বা Windows Services থেকে MySQL চালু করো। Custom MySQL location হলে একবার `setx CAREERFORGE_MYSQLD "C:\path\to\mysqld.exe"` চালিয়ে নতুন terminal খোলো।
- **Database access denied**: `.env`-এর `DB_USERNAME`/`DB_PASSWORD` ঠিক করো।
- **Port 4000 বা 5174 already running**: আগের API/Frontend terminal বন্ধ করে আবার launcher চালাও।
- **Maven download failed**: Internet চালু করে `run-backend.bat` আবার চালাও।
