import { loadFees } from './config/fees.ts';
import { InMemoryDatabase } from './db/database.ts';
import { FakePaymentGateway } from './gateways/paymentGateway.ts';
import { StaticPricingClient } from './gateways/pricing.ts';
import { CachingPricingClient } from './gateways/cachingPricing.ts';
import { PriceBook } from './gateways/priceBook.ts';
import { FakeShippingGateway } from './gateways/shippingGateway.ts';
import { EventBus } from './lib/events.ts';
import { InventoryRepository } from './repositories/inventoryRepository.ts';
import { OrderRepository } from './repositories/orderRepository.ts';
import { CartService } from './services/cartService.ts';
import { CatalogService } from './services/catalogService.ts';
import { CheckoutService, ReceiptService, RewardsService } from './services/checkoutService.ts';
import { FulfillmentService } from './services/fulfillmentService.ts';
import { GiftCardService } from './services/giftCardService.ts';
import { LoyaltyService } from './services/loyaltyService.ts';
import { OrderService } from './services/orderService.ts';
import { PaymentService } from './services/paymentService.ts';
import { QuoteService } from './services/quoteService.ts';
import { RefundService } from './services/refundService.ts';

export const DEFAULT_PRICES: Record<string, number> = {
  'SKU-KEYBOARD': 49.5,
  'SKU-MOUSE': 19.99,
  'SKU-MONITOR': 189,
  'SKU-CABLE': 7.25,
};

/** Wires the service graph with in-process fakes. */
export function createApp(prices: Record<string, number> = DEFAULT_PRICES) {
  const db = new InMemoryDatabase();
  const orders = new OrderRepository();
  const inventory = new InventoryRepository();
  const pricing = new StaticPricingClient(prices);
  const paymentGateway = new FakePaymentGateway();
  const shippingGateway = new FakeShippingGateway();
  const priceBook = new PriceBook(prices);
  const bus = new EventBus();
  const paymentService = new PaymentService(db, paymentGateway);
  const loyaltyService = new LoyaltyService(db);
  const receiptService = new ReceiptService();
  return {
    db,
    orders,
    inventory,
    pricing,
    paymentGateway,
    shippingGateway,
    priceBook,
    orderService: new OrderService(db, orders, inventory, pricing),
    paymentService,
    fulfillmentService: new FulfillmentService(db, orders, shippingGateway),
    refundService: new RefundService(db, orders, inventory),
    catalogService: new CatalogService(priceBook, new CachingPricingClient(priceBook)),
    giftCardService: new GiftCardService(db),
    loyaltyService,
    quoteService: new QuoteService(pricing, loadFees()),
    bus,
    receiptService,
    checkoutService: new CheckoutService(paymentService, bus, new RewardsService(loyaltyService), receiptService),
    cartService: new CartService(),
  };
}

export type App = ReturnType<typeof createApp>;
