const PACKAGE_NAME = "daybreak-app";

export function exportZipFileName(appTitle: string | null | undefined): string {
  const slug = (appTitle ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || PACKAGE_NAME}.zip`;
}

export function buildExportPackageJson(dependencies: Record<string, string>) {
  return {
    name: PACKAGE_NAME,
    version: "1.0.0",
    private: true,
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
      ...dependencies,
    },
    scripts: {
      start: "react-scripts start",
      build: "react-scripts build",
    },
    browserslist: {
      production: [">0.2%", "not dead", "not op_mini all"],
      development: ["last 1 chrome version"],
    },
  };
}

export const EXPORT_README = `# Daybreak App

Generated with Daybreak.

## Getting started

\`\`\`bash
npm install
npm start
\`\`\`
`;
