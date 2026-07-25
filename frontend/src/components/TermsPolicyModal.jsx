import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Scale, FileText } from 'lucide-react';

export default function TermsPolicyModal({ initialTab = 'terms', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content animate-fade-in"
        style={{ 
          maxWidth: '750px', 
          padding: 0, 
          overflow: 'hidden', 
          borderRadius: '24px', 
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
          color: '#1e293b',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '28px 32px 0',
          borderBottom: '1px solid #f1f5f9',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.12)'
            }}>
              <Scale size={22} style={{ color: '#d97706' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '0.5px' }}>
                Legal Center
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                Elmen Terms of Service &amp; Privacy Policies
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#475569',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            <X size={16} />
          </button>

          {/* Tab selectors */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('terms')}
              style={{
                background: 'none', border: 'none', padding: '12px 6px',
                fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer',
                color: activeTab === 'terms' ? '#d97706' : '#64748b',
                borderBottom: activeTab === 'terms' ? '3px solid #eab308' : '3px solid transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                background: 'none', border: 'none', padding: '12px 6px',
                fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer',
                color: activeTab === 'privacy' ? '#d97706' : '#64748b',
                borderBottom: activeTab === 'privacy' ? '3px solid #eab308' : '3px solid transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div style={{
          padding: '24px 32px 32px',
          background: '#ffffff',
          color: '#475569',
          fontSize: '0.88rem',
          lineHeight: '1.6',
          maxHeight: '55vh',
          overflowY: 'auto',
          textAlign: 'left'
        }}>
          {activeTab === 'terms' ? (
            /* ── Terms of Service content ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.82rem', fontWeight: 800 }}>
                  IF YOU DO NOT AGREE TO THESE TERMS AND CONDITIONS, PLEASE DO NOT USE OR ACCESS THIS WEBSITE.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Refusal of service</h3>
                <p style={{ margin: 0 }}>We reserve the right to refuse service to anyone at any time. We reserve the right, in our sole discretion, to suspend or cancel the service at any time if a computer virus, bug, or other technical problem corrupts the security, or proper administration of the service.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Financial Details</h3>
                <p style={{ margin: 0 }}>You agree, understand and confirm that the credit / debit card details or other financial details provided by you for availing of services on the Website will be correct and accurate and you shall not use the credit /debit card or financial facility which is not lawfully owned / obtained by you. You also understand that any financial information submitted by you is directly received by our acquiring bank and not taken by us. We will not be liable for any credit / debit card fraud. The liability for use of a card fraudulently will be on you and the onus to ‘prove otherwise’ shall be exclusively on you. We and our associated acquiring bank or financial institutions reserve the right to recover the cost of goods, collection charges and lawyers fees from persons using the Website fraudulently. We and our associated acquiring banks or financial institutions reserve the right to initiate legal proceedings against such persons for fraudulent use of the Website and any other unlawful acts or acts or omissions in breach of these terms and conditions in accordance with applicable laws.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Communication</h3>
                <p style={{ margin: 0 }}>When you visit the Website or send emails to us, you are communicating with us electronically. You consent to receive communications from us electronically. We will communicate with you by email or by posting notices on the Website. You agree that all agreements, notices, disclosures and other communications that we provide to you electronically satisfy any legal requirement that such communications be in writing. When you submit your phone number along with your shipping address or to request our call back, you consent to receive calls on that number for communication related to your order/request and other site related communication.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Website feedback, user comments and user generated content</h3>
                <p style={{ margin: 0 }}>All reviews, comments, feedback, postcards, suggestions, ideas, and other submissions disclosed, submitted to us on or by this Website or otherwise disclosed, submitted or offered in connection with your use of this Website (collectively, the “Comments”) shall be and remain our property. Such disclosure, submission or offer of any Comments shall constitute an assignment to us of all worldwide rights, titles and interests in all copyrights and other intellectual properties in the Comments. Thus, we own exclusively all such rights, titles and interests and shall not be limited in any way in its use, commercial or otherwise, of any Comments. We will be entitled to use, reproduce, disclose, modify, adapt, create derivative works from, publish, display and distribute any Comments you submit for any purpose whatsoever, without restriction and without compensating you in any way. We are and shall be under no obligation (1) to maintain any Comments in confidence; (2) to pay you any compensation for any Comments; or (3) to respond to any Comments. You agree that any Comments submitted by you to the Website will not violate this policy or any right of any third party, including copyright, trademark, privacy or other personal or proprietary right(s), and will not cause injury to any person or entity. You further agree that no Comments submitted by you to the Website will be or contain libelous or otherwise unlawful, threatening, abusive or obscene material, or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings or any form of ‘spam’. We do not regularly review posted Comments, but do reserve the right (but not the obligation) to monitor and edit or remove any Comments submitted on the Website. You grant us the right to use the name that you submit in connection with any Comments. You agree not to use a false email address, impersonate any person or entity, or otherwise mislead as to the origin of any Comments you submit. You are and shall remain solely responsible for the content of any Comments you make and you agree to indemnify us and our affiliates for all claims resulting from any Comments you submit. We and our affiliates take no responsibility and assume no liability for any Comments submitted by you or any third party.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Copyright &amp; Trademark</h3>
                <p style={{ margin: 0 }}>We and our suppliers and licensors expressly reserve all intellectual property rights in all text, programs, products, processes, technology, content and other materials, which appear on this Website. Access to this Website does not confer and shall not be considered as conferring upon anyone any license under any of our or any third party’s intellectual property rights. All rights, including copyright, in this Website are owned by or licensed to us. Any use of this Website or its contents, including copying or storing it or them in whole or part, other than for your own personal, non-commercial use is prohibited without our prior permission. You may not modify, distribute or re-post anything on this Website for any purpose. The Elmen names and logos and all related product and service names, design marks and slogans are the trademarks or service marks of Elmen or licensed to Elmen. All other marks are the property of their respective companies and you shall not use or exploit the same in any manner whatsoever. No trademark or service mark license is granted to you in connection with the materials contained on this Website. Access to this Website does not authorize anyone to use any name, logo or mark which appear on the Website in any manner. References on this Website to any names, marks, products or services of third parties or hypertext links to third party websites or information are provided solely as a convenience to you and do not in any way constitute or imply our endorsement, sponsorship or recommendation of the third party, information, product or service. We are not responsible for the content of any third party websites and does not make any representations regarding the content or accuracy of material on such websites. If you decide to link to any such third party websites, you do so entirely at your own risk. All materials, including images, text, illustrations, designs, icons, photographs, programs, music clips or downloads, video clips and written and other materials that are part of this Website (collectively, the “Contents”) are intended solely for personal, non-commercial use. You may download or copy the Contents and other downloadable materials displayed on the Website for your personal use only. No right, title or interest in any downloaded materials or software is transferred to you as a result of any such downloading or copying. You may not reproduce (except as noted above), publish, transmit, distribute, display, modify, create derivative works from, sell or participate in any sale of or exploit in any way, in whole or in part, any of the Content, the Website or any related software. All software used on this Website is the property of Elmen or its suppliers and licensors and protected by Indian and international copyright laws. The Content and software on this Website may be used only as a shopping resource. Any other use, including the reproduction, modification, distribution, transmission, republication, display, or performance, of the Content on this Website is strictly prohibited. Unless otherwise noted, all Content are copyrights, trademarks, trade dress and/or other intellectual property owned, controlled or licensed by us, our affiliates or by third parties who have licensed their materials to us and are protected by Indian and international copyright laws. The compilation (meaning the collection, arrangement, and assembly) of all Content on this Website is the exclusive property of Elmen and is also protected by Indian and international copyright. We don’t offer any Counterfeit goods contain a trademark or logo that is identical to or substantially indistinguishable from the trademark of another.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Objectionable Material</h3>
                <p style={{ margin: 0 }}>You understand that by using this Website or any services provided on the Website, you may encounter Content that may be deemed by some to be offensive, indecent, or objectionable, which Content may or may not be identified as such. You agree to use the Website and any service at your sole risk and that to the fullest extent permitted under applicable law, we and our affiliates shall have no liability to you for Content that may be deemed offensive, indecent, or objectionable to you.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Termination</h3>
                <p style={{ margin: 0 }}>This User Agreement is effective unless and until terminated by either you or us. You may terminate this User Agreement at any time by informing us in writing through Indian postal system by registered post, that you no longer wish to be associated with this Website, provided that you discontinue any further use of this Website. We may terminate this User Agreement at any time and may do so immediately without notice, and accordingly deny you access to the Website. Such termination will be without any liability to Elmen. Upon any termination of the User Agreement by either you or us, you must promptly destroy all materials downloaded or otherwise obtained from this Website, as well as all copies of such materials, whether made under the User Agreement or otherwise. Our right to any Comments shall survive any termination of this User Agreement. Any such termination of the User Agreement shall not cancel your obligation to pay for the product already ordered from the Website or affect any liability that may have arisen under the User Agreement.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Limitation of Liability and Disclaimers</h3>
                <p style={{ margin: 0 }}>The Website is provided without any warranties or guarantees and in an “As Is” condition. You must bear the risks associated with the use of the Website. The Website provides content from other Internet websites or resources and while we try to ensure that material included on the Website is correct, reputable and of high quality, we shall not be held liable or responsible if this is not the case. We will not be responsible for any errors or omissions or for the results obtained from the use of such information or for any technical problems you may experience with the Website. This disclaimer does not apply to any product warranty offered by the manufacturer of the product as specified in the product specifications. This disclaimer constitutes an essential part of this User Agreement. To the fullest extent permitted under applicable law, we or our suppliers shall not be liable for any indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses arising out of or in connection with the Website, its services or this User Agreement. Without prejudice to the generality of the section above, our total liability to you for all liabilities arising out of this User Agreement be it in tort or contract is limited to the amount charged to you, against the value of the products ordered by you. Elmen, its associates and technology partners make no representations or warranties about the accuracy, reliability, completeness and/or timeliness of any content, information, software, text, graphics, links or communications provided on or through the use of the Website or that the operation of the Website will be error free and/or uninterrupted. We assume no liability whatsoever for any monetary or other damage suffered by you on account of the delay, failure, interruption, or corruption of any data or other information transmitted in connection with use of the Website; and/or any interruption or errors in the operation of the Website.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Website Security</h3>
                <p style={{ margin: 0 }}>You are prohibited from violating or attempting to violate the security of the Website, including, without limitation: accessing data not intended for you or logging onto a server or an account which you are not authorized to access; attempting to probe, scan or test the vulnerability of a system or network or to breach security or authentication measures without proper authorization; attempting to interfere with service to any other user, host or network, including, without limitation, via means of submitting a virus to the Website, overloading, ‘flooding,’ ‘spamming’, ‘mail bombing’ or ‘crashing’; sending unsolicited email, including promotions and/or advertising of products or services; or forging any TCP/IP packet header or any part of the header information in any email or newsgroup posting. Violations of system or network security may result in civil or criminal liability. We will investigate occurrences that may involve such violations and may involve, and cooperate with, law enforcement authorities in prosecuting users who are involved in such violations. You agree not to use any device, software or routine to interfere or attempt to interfere with the proper working of this Website or any activity being conducted on this Website. You agree, further, not to use or attempt to use any engine, software, tool, agent or other device or mechanism (including without limitation browsers, spiders, robots, avatars or intelligent agents) to navigate or search this Website other than the search engine and search agents available from Elmen on this Website and other than generally available third party web browsers.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Entire Agreement</h3>
                <p style={{ margin: 0 }}>If any part of this User Agreement is determined to be invalid or unenforceable pursuant to applicable law including, but not limited to, the warranty disclaimers and liability limitations set forth above, then the invalid or unenforceable provision will be deemed to be superseded by a valid, enforceable provision that most closely matches the intent of the original provision and the remainder of the User Agreement shall continue in effect. Unless otherwise specified herein, this User Agreement constitutes the entire agreement between you and us with respect to the Websites/services and it supersedes all prior or contemporaneous communications and proposals, whether electronic, oral or written, between you and us with respect to the Websites/services. Our failure to act with respect to a breach by you or others does not waive its right to act with respect to subsequent or similar breaches.</p>
              </div>
            </div>
          ) : (
            /* ── Privacy Policy content ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Consent and Data Collection</h3>
                <p style={{ margin: 0 }}>All the information provided to us by you, including sensitive personal information, is voluntary. You have the right to withdraw your consent at any time, in accordance with the terms of this User Agreement, but please note that withdrawal of consent will not be retroactive. You can access, modify, correct and eliminate the data about you which has been collected pursuant to your decision to become a user of the Website. If you update any information relating to you, we may keep a copy of the information which you originally provided to us in its archives.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Browsing and IP Tracking</h3>
                <p style={{ margin: 0 }}>Due to the communications standards on the Internet, when you visit the Website, we automatically receive the URL of the site from which you came and the site to which you are going when you leave. We also receive the Internet Protocol (IP) address of your computer (or the proxy server you used to access the World Wide Web), your computer operating system and type of web browser you are using, email patterns, as well as the name of your internet service provider (ISP). This information is used to analyze overall trends to help us improve our service. The linkage between your IP address and your personally identifiable information is not shared with third-parties without your permission or except when required by law. Notwithstanding the above, we may share some of the aggregate findings and details with advertisers, sponsors, investors, strategic partners, and others in order to help grow our business without obtaining any approval from you.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Cookie Policy</h3>
                <p style={{ margin: 0 }}>The Website uses temporary cookies to store certain data (that is not sensitive personal data or information) that is used by us and our service providers for the technical administration of the Website, research and development, and for administration. In the course of serving advertisements or optimizing services to you, we may allow authorized third parties to place or recognize a unique cookie on your browser. We do not store personally identifiable information in the cookies.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Security Measures</h3>
                <p style={{ margin: 0 }}>We have in place appropriate technical and security measures to prevent unauthorized or unlawful access to or accidental loss of or destruction or damage to your information. When we collect data through the Site, we collect your personal details on a secured server through firewalls. The Company does not access, store or keep debit card data or credit card data and or any financial information. All transactions done using Secure Server Software (SSL) for 128 bit encryption through third party gateways and Elmen plays no role in the transaction, except for directing the customers to gateways or relevant webpage(s). Accordingly, Elmen shall not be responsible or liable for any loss or damage due to any disclosure whatsoever of Personal Information while using the third party gateways and or website.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Promotional Communications</h3>
                <p style={{ margin: 0 }}>We may also send you other information about us, the Site, our other websites, our products, sales promotions, our newsletters, SMS updates, anything relating to other companies in our group or our business partners. If you would prefer not to receive any of this additional information as detailed in this paragraph (or any part of it) please click the “unsubscribe” link in any email that we send to you or register as a Do Not Disturb user. Within 7 working days of receipt of your instruction we will cease to send you information as requested.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Call Records &amp; Inquiries</h3>
                <p style={{ margin: 0 }}>We may keep records of telephone calls received and made for making inquiries, orders or other purposes for the purpose of administration of services, research and development, quality management services and for proper administration.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Third Party Ads &amp; External Links</h3>
                <p style={{ margin: 0 }}>We allow other companies to serve advertisements to you. These companies include third party ad servers, ad agencies, ad technology vendors and research firms. We do NOT use personally identifiable information to target ads. This privacy policy applies to websites and services that are operated and managed by us. We do not exercise control over the sites displayed as search results or links from within its services. These other sites may place their own cookies or other files on your computer, collect data or solicit personal information from you, for which we are not responsible or liable.</p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Contact Information</h3>
                <p style={{ margin: 0 }}>
                  If any User has any grievance, comment, question or suggestion regarding any of our Product/Services, please contact our Grievance Officer, who will redress the grievances of the Users expeditiously but within one month from the date of receipt of grievance, and who can be reached by email at{' '}
                  <a href="mailto:elmenindia@gmail.com" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 700 }}>
                    elmenindia@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3 style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Health-Related Information</h3>
                <p style={{ margin: 0 }}>The information contained in the Web Site is provided for informational purposes only and is not meant to substitute for the advice provided by your doctor or other health care professional. You should not use the information available on or through the Web Site for diagnosing or treating a health problem or disease, or prescribing any medication. Information and statements regarding dietary supplements have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure, or prevent any disease. You should read carefully all products packaging prior to use. The results from the products will vary from person to person. No individual result should be seen as typical.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 32px 24px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            className="btn btn-primary"
            style={{ 
              padding: '10px 24px', 
              fontSize: '0.85rem', 
              borderRadius: '20px', 
              fontWeight: 800,
              textTransform: 'uppercase',
              backgroundColor: '#eab308',
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(234, 179, 8, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ca8a04'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eab308'}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
