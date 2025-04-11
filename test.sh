# Get certificate expiration date
domain="forwardemail.net"
expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | \
             openssl x509 -noout -enddate 2>/dev/null | \
             sed -e 's/notAfter=//')
echo $expiry_date

if [ -z "$expiry_date" ]; then
    status="ERROR"
    error_message="Could not retrieve certificate for $domain"
    days_left=0
else
    # Convert expiry date to seconds since epoch
    if [[ "$OSTYPE" == "darwin"* ]]; then
        expiry_seconds=$(gdate -d "$expiry_date" +%s)
        current_seconds=$(gdate +%s)
    else
        expiry_seconds=$(date -d "$expiry_date" +%s)
        current_seconds=$(date +%s)
    fi

    # Calculate days left
    seconds_left=$((expiry_seconds - current_seconds))
    days_left=$((seconds_left / 86400))
fi

if [ $days_left -le 7 ]; then
  echo "OH SNAP $days_left"
else
  echo "GOOD $days_left"
fi
