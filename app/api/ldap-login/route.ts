import { NextRequest, NextResponse } from "next/server";
import ldap from "ldapjs";

function escapeLdapFilter(value: string): string {
  return value.replace(/[\\*()\x00]/g, (char) =>
    "\\" + char.charCodeAt(0).toString(16).padStart(2, "0")
  );
}

export async function POST(req: NextRequest) {
  // Verify API key
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.LDAP_API_KEY) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);

  if (!body || !body.email || !body.password) {
    return NextResponse.json(
      { status: "error", message: "Invalid input data" },
      { status: 400 }
    );
  }

  const { email: username, password: ldappass } = body;

  const ldapUrl = process.env.LDAP_URL;
  const ldapBindDn = process.env.LDAP_BIND_DN;
  const ldapBindPassword = process.env.LDAP_BIND_PASSWORD;
  const ldapBaseDn = process.env.LDAP_BASE_DN;

  if (!ldapUrl || !ldapBindDn || !ldapBindPassword || !ldapBaseDn) {
    return NextResponse.json(
      { status: "error", message: "LDAP configuration is missing" },
      { status: 500 }
    );
  }

  return new Promise<NextResponse>((resolve) => {
    const client = ldap.createClient({
      url: ldapUrl,
    });

    client.on("error", () => {
      resolve(
        NextResponse.json(
          { status: "error", message: "Error connecting to LDAP" },
          { status: 500 }
        )
      );
    });

    // Bind admin
    client.bind(ldapBindDn, ldapBindPassword, (err) => {
      if (err) {
        resolve(
          NextResponse.json(
            { status: "error", message: "LDAP bind error" },
            { status: 500 }
          )
        );
        return;
      }

      // Search user
      const filter = `(&(objectClass=inetOrgPerson)(uid=${escapeLdapFilter(username)}))`;
      client.search(
        ldapBaseDn,
        { filter, scope: "sub" },
        (err, res) => {
          if (err) {
            resolve(
              NextResponse.json(
                { status: "error", message: "LDAP search error" },
                { status: 500 }
              )
            );
            return;
          }

          const entries: ldap.SearchEntry[] = [];

          res.on("searchEntry", (entry) => entries.push(entry));

          res.on("end", () => {
            if (entries.length === 0) {
              client.destroy();
              resolve(
                NextResponse.json({
                  status: "error",
                  message: "Invalid username",
                })
              );
              return;
            }

            const entry = entries[0];
            const userDn = entry.dn.toString();
            const ldapemail = entry.pojo.attributes.find(a => a.type === "mail")?.values[0];
            const fname = entry.pojo.attributes.find(a => a.type === "givenName")?.values[0];
            const userid = entry.pojo.attributes.find(a => a.type === "uid")?.values[0];

            // Verify user password
            client.bind(userDn, ldappass, (err) => {
              client.destroy();
              if (err) {
                resolve(
                  NextResponse.json({
                    status: "error",
                    message: "Invalid password",
                  })
                );
              } else {
                resolve(
                  NextResponse.json({
                    status: "success",
                    message: "Login successful",
                    id: userid,
                    email: ldapemail,
                    name: fname,
                  })
                );
              }
            });
          });
        }
      );
    });
  });
}