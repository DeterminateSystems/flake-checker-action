import * as actionsCore from "@actions/core";
import * as actionsExec from "@actions/exec";
import { IdsToolbox } from "detsys-ts";

class FlakeCheckerAction {
  idslib: IdsToolbox;
  flakeLockPath: string;
  nixpkgsKeys: string;
  checkOutdated: boolean;
  checkOwner: boolean;
  checkSupported: boolean;
  ignoreMissingFlakeLock: boolean;
  failMode: boolean;
  sendStatistics: boolean;

  constructor() {
    this.idslib = new IdsToolbox({
      name: "flake-checker",
      fetchStyle: "gh-env-style",
      diagnosticsUrl: new URL(
        "https://install.determinate.systems/flake-checker/telemetry",
      ),
    });

    this.flakeLockPath =
      actionInputStringOrNull("flake-lock-path") || "flake.lock";
    this.nixpkgsKeys = actionInputStringOrNull("nixpkgs-keys") || "nixpkgs";

    this.checkOutdated = actionInputBool("check-outdated");
    this.checkOwner = actionInputBool("check-owner");
    this.checkSupported = actionInputBool("check-supported");

    this.ignoreMissingFlakeLock = actionInputBool("ignore-missing-flake-lock");

    this.failMode = actionInputBool("fail-mode");
    this.sendStatistics = actionInputBool("send-statistics");
  }

  private async executionEnvironment(): Promise<ExecuteEnvironment> {
    const executionEnv: ExecuteEnvironment = {};

    executionEnv.NIX_FLAKE_CHECKER_FLAKE_LOCK_PATH = this.flakeLockPath;
    executionEnv.NIX_FLAKE_CHECKER_NIXPKGS_KEYS = this.nixpkgsKeys;

    if (!this.sendStatistics) {
      executionEnv.NIX_FLAKE_CHECKER_NO_TELEMETRY = "false";
    }

    if (!this.checkOutdated) {
      executionEnv.NIX_FLAKE_CHECKER_CHECK_OUTDATED = "false";
    }

    if (!this.checkOwner) {
      executionEnv.NIX_FLAKE_CHECKER_CHECK_OWNER = "false";
    }

    if (!this.checkSupported) {
      executionEnv.NIX_FLAKE_CHECKER_CHECK_SUPPORTED = "false";
    }

    if (!this.ignoreMissingFlakeLock) {
      executionEnv.NIX_FLAKE_CHECKER_IGNORE_MISSING_FLAKE_LOCK = "false";
    }

    if (this.failMode) {
      executionEnv.NIX_FLAKE_CHECKER_FAIL_MODE = "true";
    }

    return executionEnv;
  }

  async check(): Promise<number> {
    const binaryPath = await this.idslib.fetchExecutable();

    const executionEnv = await this.executionEnvironment();
    actionsCore.debug(
      `Execution environment: ${JSON.stringify(executionEnv, null, 4)}`,
    );

    const exitCode = await actionsExec.exec(binaryPath, [], {
      env: {
        ...executionEnv,
        ...process.env, // To get $PATH, etc
      },
    });

    if (exitCode !== 0) {
      this.idslib.recordEvent("execution_failure", {
        exitCode,
      });
      throw new Error(`Non-zero exit code of \`${exitCode}\` detected`);
    }

    return exitCode;
  }
}

type ExecuteEnvironment = {
  // All env vars are strings, no fanciness here.
  RUST_BACKTRACE?: string;
  NIX_FLAKE_CHECKER_FLAKE_LOCK_PATH?: string;
  NIX_FLAKE_CHECKER_NIXPKGS_KEYS?: string;
  NIX_FLAKE_CHECKER_NO_TELEMETRY?: string;
  NIX_FLAKE_CHECKER_CHECK_OUTDATED?: string;
  NIX_FLAKE_CHECKER_CHECK_OWNER?: string;
  NIX_FLAKE_CHECKER_CHECK_SUPPORTED?: string;
  NIX_FLAKE_CHECKER_IGNORE_MISSING_FLAKE_LOCK?: string;
  NIX_FLAKE_CHECKER_FAIL_MODE?: string;
};

function actionInputStringOrNull(name: string): string | null {
  const value = actionsCore.getInput(name);
  if (value === "") {
    return null;
  } else {
    return value;
  }
}

function actionInputBool(name: string): boolean {
  return actionsCore.getBooleanInput(name);
}

function main(): void {
  const checker = new FlakeCheckerAction();

  checker.idslib.onMain(async () => {
    await checker.check();
  });

  checker.idslib.execute();
}

main();
