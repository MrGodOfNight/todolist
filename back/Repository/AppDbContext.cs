using back.Domain;
using Microsoft.EntityFrameworkCore;

namespace back.Repository
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Todo> Todos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Указываем схему по умолчанию для всех таблиц
            modelBuilder.HasDefaultSchema("public");

            // Настройка таблицы Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd(); // serial4

                entity.Property(u => u.Login)
                      .HasColumnName("login")
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(u => u.Password)
                      .HasColumnName("password")
                      .IsRequired();

                entity.HasIndex(u => u.Login)
                      .IsUnique()
                      .HasDatabaseName("users_unique");
            });

            // Настройка таблицы Todos
            modelBuilder.Entity<Todo>(entity =>
            {
                entity.ToTable("todos");
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Id)
                      .HasColumnName("id")
                      .ValueGeneratedOnAdd(); // serial4

                entity.Property(t => t.Name)
                      .HasColumnName("name")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(t => t.Description)
                      .HasColumnName("description");

                entity.Property(t => t.IsCompleted)
                      .HasColumnName("iscompleted")
                      .HasDefaultValue(false)
                      .IsRequired();

                entity.Property(t => t.UserId)
                      .HasColumnName("userid")
                      .IsRequired();

                // Настройка внешнего ключа
                entity.HasOne(t => t.User)
                      .WithMany(u => u.Todos)
                      .HasForeignKey(t => t.UserId)
                      .HasConstraintName("todos_users_fk")
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
