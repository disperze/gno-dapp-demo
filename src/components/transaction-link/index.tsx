import * as React from "react";
import { Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ellideMiddle } from "../../services";

interface TransactionLinkProps {
  readonly tx: string;
  readonly maxLength?: number | null;
  readonly domain?: string;
}

export function TransactionLink({ tx, domain, maxLength = 20 }: TransactionLinkProps): JSX.Element {
  return (
    <Link
      href={`${domain || "https://rpc.gno.tools"}/tx?hash=0x${tx}`}
      isExternal>
        {ellideMiddle(tx, maxLength || 999)} <ExternalLinkIcon mx="2px" />
    </Link>
  );
}