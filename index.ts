const args = process.argv.slice(2)
if (args.length === 0) {
    console.error("No problem specified")
    process.exit(1);
}

const problem = args[0]
const variant = args[1] || "index"

const execute = async () => {
    try {
        await import(`./problems/${problem}/${variant}.ts`)
        console.log(`Executed ${problem}/${variant}.ts`)
    } catch (err) {
        console.error(`Error executing ${problem}/${variant}.ts:`, err)
        process.exit(1);
    }
}
execute()
