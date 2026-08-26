using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;

namespace BomSucessoMailing
{
    static class Program
    {
        private static HttpListener _listener;
        private static Thread _serverThread;
        private static bool _isRunning = true;
        private static int _port = 8080;
        private static string _baseDir;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            _baseDir = AppDomain.CurrentDomain.BaseDirectory;

            // Start Local HTTP Server
            if (!StartServer())
            {
                MessageBox.Show("Não foi possível iniciar o servidor local.", "Bom Sucesso Mailing", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string appUrl = "http://localhost:" + _port + "/index.html";

            // Try to launch as a standalone desktop app window via Microsoft Edge Chromium
            Process appProcess = LaunchEdgeApp(appUrl);

            if (appProcess != null)
            {
                // Wait for the desktop app window to close, then cleanly exit
                appProcess.WaitForExit();
                StopServer();
            }
            else
            {
                // Fallback: Open in default browser and show Tray / Mini Form
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
                Application.Run(new TrayApplicationContext(appUrl));
            }
        }

        private static bool StartServer()
        {
            // Try port 8080, fallback to other ports if busy
            for (int p = 8080; p <= 8090; p++)
            {
                try
                {
                    _listener = new HttpListener();
                    _listener.Prefixes.Add("http://localhost:" + p + "/");
                    _listener.Start();
                    _port = p;

                    _serverThread = new Thread(ServerWorker)
                    {
                        IsBackground = true
                    };
                    _serverThread.Start();
                    return true;
                }
                catch
                {
                    if (_listener != null)
                    {
                        try { _listener.Close(); } catch { }
                    }
                }
            }
            return false;
        }

        private static void ServerWorker()
        {
            while (_isRunning && _listener != null && _listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c), context);
                }
                catch
                {
                    if (!_isRunning) break;
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.Url.LocalPath;
                if (string.IsNullOrEmpty(rawUrl) || rawUrl == "/")
                {
                    rawUrl = "/index.html";
                }

                string relativePath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(_baseDir, relativePath);

                if (File.Exists(filePath))
                {
                    string ext = Path.GetExtension(filePath).ToLowerInvariant();
                    string mimeType = GetMimeType(ext);

                    byte[] data = File.ReadAllBytes(filePath);
                    context.Response.ContentType = mimeType;
                    context.Response.ContentLength64 = data.Length;
                    context.Response.StatusCode = 200;
                    context.Response.OutputStream.Write(data, 0, data.Length);
                }
                else
                {
                    byte[] notFound = Encoding.UTF8.GetBytes("404 Not Found");
                    context.Response.StatusCode = 404;
                    context.Response.ContentLength64 = notFound.Length;
                    context.Response.OutputStream.Write(notFound, 0, notFound.Length);
                }
            }
            catch
            {
            }
            finally
            {
                try { context.Response.OutputStream.Close(); } catch { }
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html":
                case ".htm": return "text/html; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".csv": return "text/csv; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                default: return "application/octet-stream";
            }
        }

        private static Process LaunchEdgeApp(string url)
        {
            string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edgePath))
            {
                edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            if (File.Exists(edgePath))
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = "--app=\"" + url + "\" --window-size=1360,860",
                        UseShellExecute = false
                    };
                    return Process.Start(psi);
                }
                catch
                {
                }
            }
            return null;
        }

        public static void StopServer()
        {
            _isRunning = false;
            if (_listener != null)
            {
                try
                {
                    _listener.Stop();
                    _listener.Close();
                }
                catch { }
            }
        }
    }

    public class TrayApplicationContext : ApplicationContext
    {
        private NotifyIcon _trayIcon;

        public TrayApplicationContext(string appUrl)
        {
            _trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "Bom Sucesso Mailing (Ativo)",
                Visible = true
            };

            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add(new MenuItem("Abrir Bom Sucesso Mailing", (s, e) =>
            {
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
            }));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add(new MenuItem("Encerrar Aplicação", (s, e) =>
            {
                _trayIcon.Visible = false;
                Program.StopServer();
                Application.Exit();
            }));

            _trayIcon.ContextMenu = menu;
            _trayIcon.DoubleClick += (s, e) =>
            {
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
            };
        }
    }
}
