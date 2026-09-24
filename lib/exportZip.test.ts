import { describe, expect, it } from "vitest";
import {
  EXPORT_README,
  buildExportPackageJson,
  exportZipFileName,
} from "./exportZip";

describe("exportZipFileName", () => {
  it("falls back to daybreak-app.zip when there is no app title", () => {
    expect(exportZipFileName(undefined)).toBe("daybreak-app.zip");
  });

  it("slugifies the app title", () => {
    expect(exportZipFileName("  My Todo App!  ")).toBe("my-todo-app.zip");
  });

  it("falls back to daybreak-app.zip when the title has no letters or digits", () => {
    expect(exportZipFileName("!!! ???")).toBe("daybreak-app.zip");
  });
});

describe("buildExportPackageJson", () => {
  it("names the package daybreak-app and includes the app's dependencies", () => {
    const pkg = buildExportPackageJson({ "framer-motion": "^11.0.0" });
    expect(pkg.name).toBe("daybreak-app");
    expect(pkg.dependencies).toMatchObject({
      react: "^18.2.0",
      "react-scripts": "5.0.1",
      "framer-motion": "^11.0.0",
    });
    expect(pkg.scripts.start).toBe("react-scripts start");
  });
});

describe("EXPORT_README", () => {
  it("credits Daybreak without linking anywhere", () => {
    expect(EXPORT_README).toMatch(/^# Daybreak App\n/);
    expect(EXPORT_README).toContain("Generated with Daybreak.");
    expect(EXPORT_README).not.toMatch(/https?:\/\//);
  });
});
