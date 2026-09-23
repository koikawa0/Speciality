import { Link } from "react-router-dom";

export default function Error() {
	return (
		<div className="error-page">
			<style>
				{`
				.error-page {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					position: fixed;
					inset: 0;
					gap: 8px;
				}
				.error-page h1 {
          			font-size: 48px;
             		margin: 0;
            	}
             	.error-page p {
              		margin: 0;
              	}

               	.error-page a {
                	background-color: var(--backC);
                	font-size: 16px;
                	text-decoration: none;
                 	color: var(--fontC);
                 	padding: 6px 12px;
                  	margin-top: 24px;
                  	border-radius: 4px;
                  	border: 1px solid white;
                   	display: inline-block;
                    transition: background-color 0.2s ease;
                }

                .error-page a:hover {
                	background-color: var(--hoverC)
                }
				`}
			</style>

			<h1>Error 404</h1>
			<p>Page Not Found</p>
			<Link to="/">Go Back To Home</Link>
			
		</div>
	);
}
