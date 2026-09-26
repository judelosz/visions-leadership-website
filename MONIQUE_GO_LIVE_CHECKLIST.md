# What Monique needs to do to launch the Visions website

This checklist keeps the business accounts in Monique's control. Do not send passwords, recovery codes, bank information, identity documents, or payment credentials to the website maintainer.

## Before the launch session

1. Create a Netlify account with a business-controlled email address.
2. Verify the email address.
3. Turn on two-factor authentication and save the recovery codes somewhere private.
4. Choose a Netlify plan. Personal is the recommended business plan; Free is acceptable for a low-traffic initial launch if its current limits are understood.
5. Keep access to the Wix account that currently manages `visionsleadershipclc.com`. Do not cancel Wix or delete the old website yet.
6. Confirm that Monique can access the email inbox used for Netlify form notifications.
7. Be available for two short handoffs during launch: signing in to Netlify and approving the final domain change.

Stripe credentials are not needed to launch this version of the website. The course and coaching buttons use Kajabi. Book checkout can be connected later with Stripe Payment Links after shipping, tax, inventory, receipt, refund, and return settings are confirmed.

## What Jude/the maintainer will do

1. Keep the website source in a private GitHub repository. Only production website files are included; raw photography, owner email, course source materials, archives, and internal documents are excluded.
2. Connect that repository to a new Netlify project inside Monique's Netlify account.
3. Let Netlify build the site using the included configuration and publish only the generated `dist` folder.
4. Test every page, form, redirect, Kajabi button, travel link, mobile layout, and event listing on the temporary Netlify address.
5. Configure form-submission notifications to the business email Monique approves.
6. Connect the event editor after the repository and Netlify project exist.
7. Add the production domain in Netlify and prepare the exact DNS records needed for Wix.

## During the launch session

1. Monique signs in to Netlify herself. She should not share the password.
2. The maintainer links the private repository and confirms that the first production build succeeds.
3. Monique reviews the temporary `*.netlify.app` preview and approves it.
4. Submit the contact and organization forms and confirm the submissions and email notifications arrive.
5. Open every Kajabi checkout from the preview. Do not complete a purchase unless Monique specifically wants a live transaction test.
6. Record the existing Wix DNS records, especially MX, SPF, DKIM, DMARC, and verification records used by email.
7. Add `visionsleadershipclc.com` and `www.visionsleadershipclc.com` to Netlify. Make `www.visionsleadershipclc.com` the primary address.
8. In Wix DNS, change only the website A/CNAME records to the values Netlify provides. Leave email records unchanged.
9. Wait for Netlify to verify the domain and issue HTTPS. Then test both domain versions, all pages, forms, redirects, and external checkout links again.

## After launch

1. Keep the old Wix site and plan untouched for at least two weeks while the Netlify site is monitored.
2. Keep the domain registration active at Wix unless it is deliberately transferred later.
3. Export or preserve any Wix contacts, form submissions, store orders, invoices, product records, and event history Monique needs to retain.
4. Review Wix subscriptions one by one. Website hosting, the domain, business email, and paid apps may be separate charges.
5. Cancel only the obsolete Wix website plan after Monique approves. Do not cancel the domain or business email.

## How Monique will update events

The public website can launch before the editor is activated, but the editor should be completed before final handoff.

The recommended current setup is Decap Turbo connected to the private GitHub repository. Monique can own the editor account and publish events without learning Git or editing code. A one-time maintainer authorization connects the private repository. Each published event creates a recorded change and triggers a fresh Netlify deployment.

Once enabled, Monique will:

1. Open `https://www.visionsleadershipclc.com/admin/`.
2. Sign in with her editor account.
3. Open **Website content → Events and announcements**.
4. Add the event title, date, time, location, short description, button link, approved flyer, and accurate image description.
5. Set the event to `draft`, `current`, or `archive`.
6. Turn on **Show on homepage** only for the event that should appear on the homepage.
7. Publish and wait a few minutes for Netlify to rebuild the website.
8. After the event, change it to `archive` and turn off **Show on homepage** instead of deleting it.

## Is GitHub required?

No. Netlify can host the built `dist` folder through a manual upload without GitHub. That option is not recommended here because every update would require somebody to rebuild and upload the site manually, and Monique's event editor would not have a reliable publishing workflow.

For this website, a private Git repository is the practical foundation for automatic deployment, version history, rollback, and the event editor. The repository can begin in Jude's GitHub account. Monique does not need a GitHub account for the initial launch. For complete long-term ownership, she can later create a free GitHub account or business organization and receive a repository transfer without changing the public website.

## Launch is complete when

- the Netlify production build is green;
- the temporary preview has Monique's approval;
- both forms have been tested;
- the domain and HTTPS work at both the apex and `www` addresses;
- Kajabi, travel, event, phone, and email links work;
- form notifications arrive;
- the event editor can publish a test change; and
- Wix remains preserved as an unpublished fallback during the stability period.
