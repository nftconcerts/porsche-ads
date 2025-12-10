import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0E0E12] text-gray-100">
      <div className="flex flex-col items-center justify-start min-h-full py-10 px-4">
        <h1 className="mt-10 mb-10 font-bold text-3xl text-white">
          Privacy Policy
        </h1>
        <div className="w-11/12 lg:w-3/4 max-w-4xl">
          <h3 className="underline font-bold text-2xl mb-4 text-white">
            Acceptance of Privacy Policy
          </h3>{" "}
          <p className="mb-4">
            This Privacy Policy applies to the website:{" "}
            <span className="underline">porsche-ads.vercel.app</span> (the
            &quot;Site&quot;) and does not govern privacy practices associated
            with offline activities. These are the guidelines used by NFT
            Concerts Inc. (&quot;COMPANY&quot;) (currently doing business as
            &quot;Porsche Ad Builder&quot;) in protecting your privacy. The Site
            is only directed to those in the United States; however it may be
            accessed from many different places around the world. By accessing
            the Site, you agree that the laws of Delaware apply to all matters
            related to your interaction with the Site. COMPANY reserves the
            right to modify these terms at any time and in any manner, without
            prior notice.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">Rights</h4>
          <p className="mb-4">
            {" "}
            COMPANY respects your privacy and is committed to protecting the
            information you provide us through the Site. We do not sell or
            distribute user information to unaffiliated third parties, except as
            needed to provide services that you have requested. We may gather
            Site use information and distribute this information to affiliated
            companies in order to serve your needs and respond to your
            information requests.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">
            {" "}
            User Information
          </h4>
          <p className="mb-4">
            During your interaction with the Site, COMPANY may request
            information from you. The only information COMPANY will collect and
            store about you is information you decide to provide us. If you have
            voluntarily submitted user information to us through an email,
            contact form, account creation, or payment processing, COMPANY will
            only use such information for the purpose that it was provided or as
            otherwise permitted by law. When you create an account or make a
            purchase, we collect your email address and payment information
            (processed securely through Stripe). We use Firebase Authentication
            and Firestore to securely store your account information.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">
            Payment Information
          </h4>
          <p className="mb-4">
            All payment transactions are processed through Stripe, a third-party
            payment processor. COMPANY does not directly store your credit card
            information. Please refer to Stripe&apos;s Privacy Policy for
            information on how they handle your payment data. We only receive
            confirmation of successful payments and basic transaction details
            necessary to provide our services.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">Uploaded Images</h4>
          <p className="mb-4">
            Images you upload to create your custom advertisements are processed
            in your browser and are not permanently stored on our servers unless
            you explicitly save them to your account. We do not use your
            uploaded images for any purpose other than creating your custom
            advertisements. You retain all rights to images you upload, and we
            will not share, sell, or distribute your images to third parties.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">
            Other Information
          </h4>
          <p className="mb-4">
            COMPANY may use server logs to record a visitor&apos;s Internet
            Protocol (IP) address and to collect general information about the
            visit to the Site, such as the time and length of the visit, pages
            accessed, and actions taken during the visit. COMPANY may use this
            information for Site management and performance monitoring only.
            COMPANY does not make this information available to unaffiliated
            third parties, but may share it with affiliated companies.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">Cookies</h4>
          <p className="mb-4">
            COMPANY may use cookies from time to time to allow COMPANY to tailor
            the Site to your preferences or interests, customize promotions or
            marketing, maintain your login session, or identify which areas of
            the Site are more popular. A cookie is a small, unique text file
            that a website can send to your computer hard drive when you visit
            that site. COMPANY does not make any cookie information available to
            unaffiliated third parties. Most web browsers can either alert you
            to the use of cookies or refuse to accept cookies entirely. If you
            do not want COMPANY to deploy cookies in your browser, you can set
            your browser to reject cookies or to notify you when a website tries
            to put a cookie on your computer. Rejecting cookies may affect your
            ability to use some of the services available on the Site, including
            maintaining your login session.
          </p>{" "}
          <h4 className="font-bold text-xl mb-4 text-white">
            Third-Party Services
          </h4>
          <p className="mb-4">
            We use the following third-party services to operate our Site:
            <br />• <strong>Firebase</strong> (Google) - for authentication and
            database services
            <br />• <strong>Stripe</strong> - for payment processing
            <br />• <strong>Google Sign-In</strong> - for optional
            authentication
            <br />
            Each of these services has their own privacy policies that govern
            how they collect and use data. We encourage you to review their
            privacy policies.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">Security</h4>
          <p className="mb-4">
            To prevent unauthorized access to any user information, COMPANY has
            put in place commercially reasonable physical, electronic, and
            managerial procedures to safeguard and secure the information it
            collects through this Site. However, COMPANY cannot guarantee the
            security of any information you transmit to COMPANY or guarantee
            that your information on the Site may not be accessed, disclosed,
            altered, or destroyed by breach of any of our physical, technical,
            or managerial safeguards.
          </p>
          <h4 className="font-bold text-xl mb-4 text-white">
            Data Retention and Deletion
          </h4>
          <p className="mb-4">
            We retain your account information for as long as your account is
            active or as needed to provide you services. You have the right to
            request deletion of your account and all associated data at any
            time. To delete your data, please contact us at{" "}
            <a href="mailto:jimmy@nftconcerts.com" className="underline">
              jimmy@nftconcerts.com
            </a>
            . Upon request, we will delete your account and all associated data
            from our systems, subject to any legal obligations to retain certain
            information.
          </p>
          <h3 className="underline font-bold text-xl mb-4 text-white">
            For More Information
          </h3>
          <p className="mb-4">
            If you have any comments, concerns or questions regarding this
            privacy policy, please contact us at{" "}
            <a href="mailto:jimmy@nftconcerts.com" className="underline">
              jimmy@nftconcerts.com
            </a>
            .
          </p>
          <p className="mb-16 font-bold">Last updated on December 9, 2025.</p>
        </div>
      </div>
    </div>
  );
}
