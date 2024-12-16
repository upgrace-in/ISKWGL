import { useEffect } from 'react';

function SubmitForm({ data }) {

    useEffect(() => {

        if (!data) return

        const formHTML = `<html>
                            <head><title>Redirecting...</title></head>
                            <body>
                                <form id="redirectForm" method="post" action="https://www.cashfree.com/checkout/post/submit">
                                    ${Object.entries(data)
                .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                .join('')}
                                </form>
                            </body>
                            </html>
                        `

        document.body.innerHTML = formHTML;

        document.forms[0].submit();

        return () => {
            document.body.innerHTML = '';
        }

    }, [data])

    return null;
}

export default SubmitForm;
