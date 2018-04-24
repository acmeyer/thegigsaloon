#import <UIKit/UIKit.h>
#import <RCTOneSignal.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (strong, nonatomic) RCTOneSignal* oneSignal;

@end
