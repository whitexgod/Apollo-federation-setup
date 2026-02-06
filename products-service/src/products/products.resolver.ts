import { Resolver, Query, Mutation, Args, ResolveReference, Float, Int } from '@nestjs/graphql';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // Public query - no authentication required
  @Query(() => [Product], { name: 'products' })
  findAll() {
    return this.productsService.findAll();
  }

  // Public query - no authentication required
  @Query(() => Product, { name: 'product', nullable: true })
  findOne(@Args('id') id: string) {
    return this.productsService.findById(id);
  }

  // Public query - no authentication required
  @Query(() => [Product], { name: 'productsByCategory' })
  findByCategory(@Args('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  // Gateway will handle authentication - no @Auth guard here
  @Mutation(() => Product)
  createProduct(
    @Args('name') name: string,
    @Args('description') description: string,
    @Args('price', { type: () => Float }) price: number,
    @Args('stock', { type: () => Int }) stock: number,
    @Args('category') category: string,
  ) {
    return this.productsService.create(name, description, price, stock, category);
  }

  // Gateway will handle authentication - no @Auth guard here
  @Mutation(() => Product, { nullable: true })
  updateProductStock(
    @Args('id') id: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.productsService.findById(reference.id);
  }
}
