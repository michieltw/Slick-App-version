from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 900})

        page.goto("http://localhost:5173/login")
        page.get_by_text("League Admin").click()

        page.goto("http://localhost:5173/schedule")
        page.get_by_role("link", name="Launch Scorekeeper").first.click()

        page.get_by_role("button", name="Goal").first.click()
        page.wait_for_timeout(500)

        # Modal team select (using aria-label or just locator relative to modal)
        modal = page.locator(".bg-slate-900.px-6.py-4").locator("..") # Find modal container

        team_select = page.locator("label:has-text('Team') + select")
        team_select.select_option(index=1)

        page.wait_for_timeout(500)

        player_select = page.locator("label:has-text('Goal Scorer') + select")
        opts = player_select.locator("option").all()
        print(f"Goal Scorer options count: {len(opts)}")
        for opt in opts:
            print(f"Option: {opt.text_content()} | value: {opt.get_attribute('value')}")

        if len(opts) > 1:
            player_select.select_option(index=1)

        page.get_by_role("button", name="Save Event").click()
        page.wait_for_timeout(500)

        print(f"Record goal visible? {page.get_by_role('heading', name='Record goal').is_visible()}")

        browser.close()

if __name__ == "__main__":
    verify_app()
