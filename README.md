# ChatGPT Long Chat Optimiser

A Chrome extension that virtualises ChatGPT conversations to improve scrolling performance on long chats. This project was developed with iterative assistance from ChatGPT, and refined through hands-on adjustments and continuous improvement.

## Overview

When ChatGPT conversations become very long, the DOM can get overloaded and scrolling performance suffers. ChatGPT Long Chat Optimiser solves this by virtualising message rendering—loading only the messages in view and unloading those that aren’t needed. This approach enhances performance, especially on low‑resource devices.

*Note:* Although ChatGPT provided initial code suggestions, the final product required significant manual iteration and fine‑tuning to achieve a stable, production‑ready solution.

## Features

- **Virtualised Rendering:** Only a subset of messages is rendered at any time, reducing DOM load.
- **Custom Scroll Button:** Replaces the native scroll-to-bottom button for improved user experience.
- **Debug Overlay:** Displays runtime statistics such as message counts and scroll metrics (toggle with Ctrl+Shift+Y).
- **Modular Architecture:** Written using ES modules for easy extension and maintenance.
- **Bundled for Compatibility:** Source code is modular, but a bundled version is available for wider browser support.

## Installation

### For End Users

1. **Download a Pre-Built Release:** Visit the [Releases](https://github.com/abbyslab/chatgpt-long-chat-optimiser/releases) section and download the latest ZIP file.

2. **Load the Extension:**

    - Extract the ZIP.

    - Open `chrome://extensions/`, enable **Developer mode**, and click **Load unpacked**.

    - Select the extracted folder.

### For Developers

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/abbyslab/chatgpt-long-chat-optimiser.git
   cd chatgpt-long-chat-optimiser
   ```

1. **Install Dependencies:**

   1. Install Node.js, e.g. for Debian:

      ```bash
      sudo apt update
      sudo apt install nodejs npm
      ```

   1. Install project dependencies:

      ```bash
      npm install
      ```

1. **Build the Extension:** The project uses Webpack to bundle the modular source code into production‑ready scripts.

   - For development

     ```bash  
     npm run dev
     ```

   - For production

     ```bash
     npm run build
     ```

   The bundled files are output to the `dist` folder.

1. **Load the Extension in Chrome:**

    - Open `chrome://extensions/`

    - Enable **Developer mode**.

    - Click **Load unpacked** and select the repository folder (ensure `manifest.json` is in the root).

    - Test and modify as needed.

1. **Development Mode (Optional):** To rebuild automatically on file changes, run:

   ```bash
   npm run watch
   ```

## Configuration

For production deployments, edit the `config.js` file and set `DEBUG` to `false` to suppress debug logging and reduce console spam:

```js
export const CONFIG = {
  // ... other settings ...
  DEBUG: false,  // Disable debug logging in production
  OVERLAY_ENABLED: true,
};
```

## Usage

After installation, the extension will automatically improve the performance of long ChatGPT conversations by virtualising message rendering. The custom scroll button and debug overlay (toggle with Ctrl+Shift+Y) provide enhanced control and visibility over the chat interface.

## Contributing

Contributions are welcome! To contribute:

- Fork the repository.

- Create a new branch for your feature or bugfix.

- Ensure your changes follow the existing modular structure.

- Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project was developed with iterative assistance from ChatGPT. While the model provided initial code suggestions, extensive manual iterations and adjustments were required to produce a stable, working solution.
