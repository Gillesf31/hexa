import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: [
            "**/dist",
            "**/out-tsc"
        ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                        {
                            sourceTag: "scope:book",
                            onlyDependOnLibsWithTags: [
                                "scope:appointments"
                            ]
                        },
                        {
                            sourceTag: "scope:appointments",
                            onlyDependOnLibsWithTags: [
                                "scope:appointments"
                            ]
                        },
                        {
                            sourceTag: "type:app",
                            onlyDependOnLibsWithTags: [
                                "type:feature"
                            ]
                        },
                        {
                            sourceTag: "type:feature",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:ports",
                                "type:application",
                                "type:infrastructure",
                                "type:state",
                                "type:ui"
                            ]
                        },
                        {
                            sourceTag: "type:ui",
                            onlyDependOnLibsWithTags: [
                                "type:domain"
                            ]
                        },
                        {
                            sourceTag: "type:state",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:application"
                            ]
                        },
                        {
                            sourceTag: "type:application",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:ports"
                            ]
                        },
                        {
                            sourceTag: "type:infrastructure",
                            onlyDependOnLibsWithTags: [
                                "type:domain",
                                "type:ports"
                            ]
                        },
                        {
                            sourceTag: "type:ports",
                            onlyDependOnLibsWithTags: [
                                "type:domain"
                            ]
                        },
                        {
                            sourceTag: "type:domain",
                            onlyDependOnLibsWithTags: [
                                "type:domain"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
