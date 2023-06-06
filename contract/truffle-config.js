// noinspection ES6ConvertModuleExportToExport
module.exports = {
    /**
     * Logging settings.
     */
    solidityLog: {
        displayPrefix: "[LOG] ",
        preventConsoleLogMigration: true
    },

    /**
     * Ethereum networks where the contracts will be deployed to.
     */
    networks: {
        // Ganache client
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "5777"
        }
    },

    /**
     * Directories configuration.
     */
    contracts_directory: "./src/contracts",
    contracts_build_directory: "./build/src/contracts",
    migrations_directory: "./build/src/migrations",

    /**
     * Compiler settings.
     */
    compilers: {
        solc: {
            version: "0.8.19",
            language: "Solidity",
            debug: {
                // How to treat revert (and require) reason strings
                revertStrings: "debug",
                // How much extra debug information to include in comments in the produced EVM
                // assembly
                debugInfo: ["location", "snippet"]
            },
            settings: {
                optimizer: {
                    enabled: true,
                    details: {
                        peephole: true,
                        inliner: true,
                        jumpdestRemover: true,
                        orderLiterals: true,
                        deduplicate: true,
                        cse: true,
                        constantOptimizer: true,
                        yul: true,
                        yulDetails: {
                            stackAllocation: true,
                            optimizerSteps: "dhfoDgvulfnTUtnIf"
                        }
                    }
                }
            }
        }
    }
};
