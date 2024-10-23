using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using QuotesApp.Data; // Namespace pro DbContext
using QuotesApp.Models;

var builder = WebApplication.CreateBuilder(args);

// Konfigurace SQLite databáze
builder.Services.AddDbContext<QuoteDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Konfigurace Identity a snížení požadavkù na heslo
builder.Services.AddIdentityApiEndpoints<IdentityUser>(options =>
{
    options.Password.RequiredLength = 4;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireDigit = false;
    options.Password.RequiredUniqueChars = 0;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<QuoteDbContext>();

builder.Services.AddControllers();

// Pøidání CORS konfigurace
builder.Services.AddCors(options =>
{
    options.AddPolicy("MyCors", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger konfigurace
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGroup("/api").MapCustomIdentityApi<IdentityUser>();
app.UseCors("MyCors");

app.Run();
