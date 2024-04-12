import * as actions_core from "@actions/core";
import * as actions_exec from "@actions/exec";
import { IdsToolbox } from "detsys-ts";
class FlakeCheckerAction {
    constructor() {
        this.idslib = new IdsToolbox({
            name: "flake-checker",
            fetchStyle: "gh-env-style",
        });
        this.flake_lock_path =
            action_input_string_or_null("flake-lock-path") || "flake.lock";
        this.nixpkgs_keys =
            action_input_string_or_null("nixpkgs-keys") || "nixpkgs";
        this.check_outdated = action_input_bool("check-outdated");
        this.check_owner = action_input_bool("check-owner");
        this.check_supported = action_input_bool("check-supported");
        this.ignore_missing_flake_lock = action_input_bool("ignore-missing-flake-lock");
        this.fail_mode = action_input_bool("fail-mode");
        this.send_statistics = action_input_bool("send-statistics");
    }
    async executionEnvironment() {
        const execution_env = {};
        execution_env.NIX_FLAKE_CHECKER_FLAKE_LOCK_PATH = this.flake_lock_path;
        execution_env.NIX_FLAKE_CHECKER_NIXPKGS_KEYS = this.nixpkgs_keys;
        if (!this.send_statistics) {
            execution_env.NIX_FLAKE_CHECKER_NO_TELEMETRY = "false";
        }
        if (!this.check_outdated) {
            execution_env.NIX_FLAKE_CHECKER_CHECK_OUTDATED = "false";
        }
        if (!this.check_owner) {
            execution_env.NIX_FLAKE_CHECKER_CHECK_OWNER = "false";
        }
        if (!this.check_supported) {
            execution_env.NIX_FLAKE_CHECKER_CHECK_SUPPORTED = "false";
        }
        if (!this.ignore_missing_flake_lock) {
            execution_env.NIX_FLAKE_CHECKER_IGNORE_MISSING_FLAKE_LOCK = "false";
        }
        if (this.fail_mode) {
            execution_env.NIX_FLAKE_CHECKER_FAIL_MODE = "true";
        }
        return execution_env;
    }
    async check() {
        const binary_path = await this.idslib.fetchExecutable();
        const execution_env = await this.executionEnvironment();
        actions_core.debug(`Execution environment: ${JSON.stringify(execution_env, null, 4)}`);
        const exit_code = await actions_exec.exec(binary_path, [], {
            env: {
                ...execution_env,
                ...process.env, // To get $PATH, etc
            },
        });
        if (exit_code !== 0) {
            this.idslib.recordEvent("execution_failure", {
                exit_code,
            });
            throw new Error(`Non-zero exit code of \`${exit_code}\` detected`);
        }
        return exit_code;
    }
}
function action_input_string_or_null(name) {
    const value = actions_core.getInput(name);
    if (value === "") {
        return null;
    }
    else {
        return value;
    }
}
function action_input_bool(name) {
    return actions_core.getBooleanInput(name);
}
function main() {
    const checker = new FlakeCheckerAction();
    checker.idslib.onMain(async () => {
        await checker.check();
    });
    checker.idslib.execute();
}
main();
