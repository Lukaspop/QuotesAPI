using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using QuotesApp.Models;

namespace QuotesApp.Data
{
    public class QuoteDbContext : IdentityDbContext<IdentityUser>
    {
        public QuoteDbContext(DbContextOptions<QuoteDbContext> options) : base(options) { }

        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<QuoteTag> QuoteTags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Definování klíče pro QuoteTag
            modelBuilder.Entity<QuoteTag>()
               .HasKey(qt => new { qt.QuoteId, qt.TagId });

            /* Vztah mezi Quote a QuoteTag
            modelBuilder.Entity<QuoteTag>()
                .HasOne(qt => qt.Quote)
                .WithMany(q => q.QuoteTags)
                .HasForeignKey(qt => qt.QuoteId);

            // Vztah mezi Tag a QuoteTag
            modelBuilder.Entity<QuoteTag>()
                .HasOne(qt => qt.Tag)
                .WithMany(t => t.QuoteTags)
                .HasForeignKey(qt => qt.TagId);*/

            // Seeding Identity user
            modelBuilder.Entity<IdentityUser>().HasData(new IdentityUser
            {
                Id = "1",
                UserName = "admin@dev.com",
                NormalizedUserName = "ADMIN",
                Email = "admin@dev.com",
                NormalizedEmail = "ADMIN@DEV.COM",
                EmailConfirmed = true,
                PasswordHash = new PasswordHasher<IdentityUser>().HashPassword(null, "admin"),
                SecurityStamp = "razitko"
            });

            // Seeding data for Tags
            modelBuilder.Entity<Tag>().HasData(
                new Tag { Id = 1, Name = "Inspiration" },
                new Tag { Id = 2, Name = "Life" },
                new Tag { Id = 3, Name = "Success" }
            );

            // Seeding data for Quotes
            modelBuilder.Entity<Quote>().HasData(
                new Quote { Id = 1, Text = "The only way to do great work is to love what you do.", UserId = "1" },
                new Quote { Id = 2, Text = "Success is not the key to happiness. Happiness is the key to success.", UserId = "1" },
                new Quote { Id = 3, Text = "Life is what happens when you're busy making other plans.", UserId = "1" }
            );

            // Seeding data for QuoteTags (vztah mezi citáty a tagy)
            modelBuilder.Entity<QuoteTag>().HasData(
                new QuoteTag { QuoteId = 1, TagId = 1 }, // "Inspiration" for quote 1
                new QuoteTag { QuoteId = 1, TagId = 2 }, // "Life" for quote 1
                new QuoteTag { QuoteId = 2, TagId = 3 }, // "Success" for quote 2
                new QuoteTag { QuoteId = 3, TagId = 2 }  // "Life" for quote 3
            );
        }
    }
}
