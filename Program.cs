using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var stopwatch = Stopwatch.StartNew();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/api/info", (IHostEnvironment environment) => Results.Ok(new
{
    application = "DeployLab",
    os = RuntimeInformation.OSDescription,
    architecture = RuntimeInformation.OSArchitecture.ToString(),
    dotnet = RuntimeInformation.FrameworkDescription,
    host = Environment.MachineName,
    environment = environment.EnvironmentName,
    uptimeSeconds = (long)stopwatch.Elapsed.TotalSeconds,
    serverTimeUtc = DateTimeOffset.UtcNow
}));
app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    checkedAtUtc = DateTimeOffset.UtcNow
}));
app.Run();
