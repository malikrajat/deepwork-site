"""A tiny static server with SPA fallback, for screenshotting the built app.

DeepWork's browser build uses real paths (`/tasks`, `/matrix`, `/settings`), and
the pages it serves are client-rendered, so any path that is not a file on disk
has to fall through to `index.html` or the capture run gets a 404 instead of a
screen.

Deliberately not a dependency: `http.server` is in the standard library, this
file exists for about twenty lines of routing, and a package would be a heavier
answer to a smaller question.

    python tools/serve-app.py <directory> <port>
"""

import http.server
import os
import sys


class SpaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def send_head(self):
        target = self.translate_path(self.path)
        if not os.path.exists(target) or os.path.isdir(target):
            self.path = "/index.html"
        return super().send_head()

    def log_message(self, *args):
        """Quiet: the capture script's own output is the useful signal."""


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2

    directory, port = sys.argv[1], int(sys.argv[2])
    handler = lambda *a, **kw: SpaHandler(*a, directory=directory, **kw)  # noqa: E731

    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"serving {directory} on http://127.0.0.1:{port}", flush=True)
        httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
