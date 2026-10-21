# DeployLab — учебный сайт на ASP.NET Core 10

Один небольшой проект для демонстрации полного жизненного цикла .NET-приложения: GitHub → Windows 11 / Visual Studio / VS Code → build → publish → Debian 13 → systemd → health checks.

## Что внутри

- `Program.cs` — сервер C# и два HTTP endpoint: `/api/info` и `/health`.
- `DeployLab.csproj` — проект ASP.NET Core под `net10.0`.
- `wwwroot/index.html` — видимая страница.
- `wwwroot/styles.css` — оформление без внешних CDN и npm.
- `wwwroot/app.js` — запросы к C# API и отображение реальных параметров ОС.
- `Properties/launchSettings.json` — HTTP-профиль для Visual Studio.
- `DEMO_STEPS.md` — сценарий демонстрации на двух ОС.

**Важно:** `/api/info` показывает имя машины, версию ОС и окружение — для учебной локальной сети это полезно, но публично доступный production-сервис так делать не должен.

## Запуск на Windows 11

Требуется .NET 10 SDK (уже установлен у автора):

```powershell
cd .\DeployLab
dotnet restore
dotnet build
dotnet run --urls http://localhost:5000
```

Открыть: http://localhost:5000

API:

```powershell
curl.exe http://localhost:5000/health
curl.exe http://localhost:5000/api/info
```

### Visual Studio 2026

`File → Open → Project/Solution` → `DeployLab.csproj`. Выбрать профиль `http` и запустить через F5 или Ctrl+F5. Профиль использует `http://localhost:5000`.

### VS Code

`File → Open Folder` → каталог `DeployLab`; установить расширение C# Dev Kit при желании. Открыть встроенный терминал и использовать команды выше.

## Сборка и публикация для Debian Linux

```powershell
dotnet publish -c Release -f net10.0 -r linux-x64 --self-contained false -o .\publish-linux
```

Публикация рассчитана на Debian 13 x86_64 **с установленным ASP.NET Core Runtime 10**. Файлы папки `publish-linux` переносятся на VM.

```powershell
ssh myrddin@192.168.3.128 'mkdir -p ~/deploylab'
scp -r .\publish-linux\* myrddin@192.168.3.128:~/deploylab/
```

Запуск на Debian (при установленном ASP.NET Core Runtime 10):

```bash
cd ~/deploylab
dotnet DeployLab.dll --urls http://0.0.0.0:5000
```

Проверить в VM: `curl http://127.0.0.1:5000/health`.

Проверить с Windows: `http://192.168.3.128:5000` (если VM доступна из Windows, порт 5000 не блокируется firewall, сервер запущен).

## Debian 13: установка Runtime

По официальной инструкции Microsoft для Debian 13:

```bash
sudo apt-get update
sudo apt-get install -y wget
wget https://packages.microsoft.com/config/debian/13/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y aspnetcore-runtime-10.0
dotnet --list-runtimes
```

Документация: https://learn.microsoft.com/en-us/dotnet/core/install/linux-debian

## GitHub

Сначала можно создать **пустой** репозиторий `deploylab` на github.com (не добавлять README/LICENSE/.gitignore, они уже в проекте). В локальном терминале:

```powershell
git init -b main
git add .
git commit -m "Initial DeployLab ASP.NET Core website"
git remote add origin https://github.com/YOUR_USERNAME/deploylab.git
git push -u origin main
```

Подставить свой логин; GitHub может запросить авторизацию. Для доклада заново выполнить `git clone https://github.com/YOUR_USERNAME/deploylab.git` в другую директорию. Не копируйте секреты и пароли в репозиторий.

## Терминальные команды для слайдов

```powershell
dotnet --info
dotnet restore
dotnet build
dotnet publish -c Release -f net10.0 -r linux-x64 --self-contained false -o .\publish-linux
```

```bash
ssh myrddin@192.168.3.128
dotnet --list-runtimes
dotnet DeployLab.dll --urls http://0.0.0.0:5000
curl -i http://127.0.0.1:5000/health
```

## Почему именно так

Это предельно простой проект без сторонних NuGet-пакетов, БД и npm. ASP.NET Core входит в framework reference веб-проекта; дополнительные NuGet-зависимости добавим отдельной учебной сценой, чтобы показать `PackageReference` и работу `dotnet restore`.
