import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  POC_V3_collection,
  SetVoucher,
} from "../generated/POC_V3_collection/POC_V3_collection";
import { Voucher, Sender } from "../generated/schema";

export function handleSetVoucher(event: SetVoucher): void {
  let senderString = event.params.sender.toHexString();

  let sender = Sender.load(senderString);

  if (sender === null) {
    sender = new Sender(senderString);
    sender.address = event.params.sender;
    sender.createdAt = event.block.timestamp;
    sender.voucherCount = BigInt.fromI32(1);
  } else {
    sender.voucherCount = sender.voucherCount.plus(BigInt.fromI32(1));
  }

  let voucher = new Voucher(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  voucher.voucher = event.params.voucher;
  voucher.sender = senderString;
  voucher.createdAt = event.block.timestamp;
  voucher.transactionHash = event.transaction.hash.toHex();

  voucher.save();
  sender.save();
}
