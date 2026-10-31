import AuthKeyz from "./authkeyz"
import { createInterface } from "readline/promises"

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const AuthKeyzApp = new AuthKeyz({
  name: "",
  ownerid: "",
  version: "",
})

async function answer() {
  try {
    await AuthKeyzApp.init()

    console.log("[1] Login\n[2] Register\n[3] License\n[4] Upgrade")

    const optionRaw = await readline.question("Select an option: ")
    const option = parseInt(optionRaw)

    let username = "",
      password = "",
      license = ""

    switch (option) {
      case 1:
        username = await readline.question("Username: ")
        password = await readline.question("Password: ")
        await AuthKeyzApp.login(username, password)
        dashboard()
        break

      case 2:
        username = await readline.question("Username: ")
        password = await readline.question("Password: ")
        license = await readline.question("License: ")
        await AuthKeyzApp.register(username, password, license)
        dashboard()
        break

      case 3:
        license = await readline.question("License: ")
        await AuthKeyzApp.license(license)
        dashboard()
        break

      case 4:
        username = await readline.question("Username: ")
        license = await readline.question("License: ")
        await AuthKeyzApp.upgrade(username, license)
        dashboard()
        break

      default:
        console.log("Invalid option selected.")
        break
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message)
    } else {
      console.error("An unknown error occurred:", error)
    }
  }
}

answer()

async function dashboard() {
  await AuthKeyzApp.fetchStats()
  console.log("Application data:")
  console.log("  App Version: ", AuthKeyzApp.app_data?.app_ver)
  console.log("  Customer panel: ", AuthKeyzApp.app_data?.customer_panel)
  console.log("  Number of Keys: ", AuthKeyzApp.app_data?.numKeys)
  console.log("  Number of Users: ", AuthKeyzApp.app_data?.numUsers)
  console.log("  Online Users: ", AuthKeyzApp.app_data?.onlineUsers)

  console.log("\nUser data:")
  console.log("  Username: ", AuthKeyzApp.user_data?.username)
  console.log("  IP Address: ", AuthKeyzApp.user_data?.ip)
  console.log("  Hardware-id: ", AuthKeyzApp.user_data?.hwid)

  const subs = AuthKeyzApp.user_data?.subscriptions || []

  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i]
    const expiry = new Date(Number(sub.expiry) * 1000)

    console.log(
      `[${i + 1}/${subs.length}] | Subscription: ${
        sub.subscription
      } - Expiry: ${expiry.toLocaleString()}`
    )
  }

  console.log(
    `Created at: ${new Date(
      (AuthKeyzApp.user_data?.createdate || 0) * 1000
    ).toLocaleString()}`
  )
  console.log(
    `Last Login: ${new Date(
      (AuthKeyzApp.user_data?.lastlogin || 0) * 1000
    ).toLocaleString()}`
  )
  console.log(
    `Expires: ${new Date(
      (AuthKeyzApp.user_data?.expires || 0) * 1000
    ).toLocaleString()}`
  )

  console.log("\n2-factor authentication:")
  console.log("[1] Enable\n[2] Disable")

  const optionRaw = await readline.question("Select an option: ")
  const option = parseInt(optionRaw)

  switch (option) {
    case 1:
      await AuthKeyzApp.enable2fa()
      break
    case 2:
      await AuthKeyzApp.disable2fa()
      break
    default:
      console.log("Invalid option selected.")
      break
  }

  console.log("Closing app in 10 seconds...")
  await new Promise(resolve => setTimeout(resolve, 10000))
  readline.close()
  await AuthKeyzApp.logout()
  process.exit(0)
}
