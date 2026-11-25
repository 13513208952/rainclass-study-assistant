# Mozilla reviewer build instructions

This source archive corresponds to Firefox extension **1.2.5**. All extension-owned JavaScript, HTML, and CSS is shipped as written, with no transpilation, bundling, minification, or generated application code.

## Environment

On Kubuntu/Ubuntu Linux, install Info-ZIP `zip` 3.0 and `unzip` 6.00 with `sudo apt install zip unzip`. The build uses the operating system's POSIX shell (`/bin/sh`) and `dirname`. No Node.js, npm, network access, or credentials are required to build. `unzip` is only used to verify the result.

From the extracted source directory, run:

```sh
sh build.sh rainclass-study-assistant.zip
unzip -t rainclass-study-assistant.zip
```

The output contains `manifest.json` at the archive root. The archive's contents can be compared with the uploaded unsigned extension (ZIP timestamps and compression metadata need not match).

## Third-party browser builds

The included third-party files are copied unmodified from their published npm tarballs. These files are already present in `vendor/`; the build does not regenerate them.

| Local file | npm release | Path inside release tarball |
| --- | --- | --- |
| `vendor/katex.min.js` | `katex@0.19.1` | `package/dist/katex.min.js` |
| `vendor/markdown-it.min.js` | `markdown-it@15.0.3` | `package/dist/browser/markdown-it.umd.min.js` |

Upstream sources: [KaTeX](https://github.com/KaTeX/KaTeX) and [markdown-it](https://github.com/markdown-it/markdown-it). Both license notices are included in `vendor/`.
