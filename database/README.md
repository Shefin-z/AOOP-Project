# Demo data

`demo_resources.sql` adds 20 published, career-focused learning resources for a CareerForge demonstration. It is idempotent, so it can be run again without duplicating a resource URL.

Import the main schema first, then run:

```bat
mysql -u root -p careerforge < database\demo_resources.sql
```

The project checks each resource URL before inserting it. Existing student save/completion progress is not changed.
