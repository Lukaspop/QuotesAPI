using HtmlAgilityPack;
using Microsoft.EntityFrameworkCore;
using QuotesApp.Data;
using QuotesApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace QuotesApp.Services
{
    public class QuoteScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly QuoteDbContext _dbContext;

        public QuoteScraperService(QuoteDbContext dbContext)
        {
            _httpClient = new HttpClient();
            _dbContext = dbContext;
        }

        public async Task ScrapeAndSaveQuotesAsync()
        {
            var url = "https://blog.hubspot.com/sales/famous-quotes";
            var response = await _httpClient.GetStringAsync(url);

            var htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(response);

            // Získání citátů
            var quoteNodes = htmlDoc.DocumentNode.SelectNodes("//p")
                                ?.Where(node => node.InnerText.Contains("–"))
                                .ToList(); // Filtruje pouze <p> elementy obsahující "–"

            if (quoteNodes != null)
            {
                foreach (var quoteNode in quoteNodes)
                {
                    // Získání textu citátu a autora
                    var quoteText = quoteNode.InnerText.Split("–")[0].Trim(); // Oddělení textu citátu od autora
                    var authorText = quoteNode.InnerText.Split("–").Last().Trim().Replace("em>", "").Replace("<", "").Replace(">", "").Trim(); // Získání autora

                    // Kontrola prázdných textů
                    if (string.IsNullOrWhiteSpace(quoteText) || string.IsNullOrWhiteSpace(authorText))
                    {
                        Console.WriteLine("Citát nebo autor je prázdný, přeskočuji.");
                        continue; // Přeskoč prázdné citáty nebo autory
                    }

                    // Zkontroluj, zda citát už neexistuje v databázi
                    var existingQuote = await _dbContext.Quotes.FirstOrDefaultAsync(q => q.Text == quoteText);

                    if (existingQuote == null)
                    {
                        // Vytvoř nový citát a přidej ho do databáze
                        var newQuote = new Quote
                        {
                            Text = quoteText,
                            UserId = "1" // Přiřaď výchozího uživatele (admin)
                        };

                        _dbContext.Quotes.Add(newQuote);

                        // Pokud chceš přidat autora jako tag
                        var authorTag = await _dbContext.Tags.FirstOrDefaultAsync(t => t.Name == authorText);

                        if (authorTag == null) // Pokud tag neexistuje, vytvoř ho
                        {
                            authorTag = new Tag { Name = authorText };
                            _dbContext.Tags.Add(authorTag);
                            await _dbContext.SaveChangesAsync(); // Ulož tag do databáze
                        }

                        var quoteTag = new QuoteTag
                        {
                            Quote = newQuote,
                            Tag = authorTag
                        };

                        _dbContext.QuoteTags.Add(quoteTag);

                        // Ulož změny do databáze
                        await _dbContext.SaveChangesAsync();

                        Console.WriteLine($"Citát '{quoteText}' od {authorText} byl uložen do databáze.");
                    }
                    else
                    {
                        Console.WriteLine($"Citát '{quoteText}' od {authorText} už existuje v databázi.");
                    }
                }
            }
            else
            {
                Console.WriteLine("Nepodařilo se najít citáty na stránce.");
            }
        }

    }
}
