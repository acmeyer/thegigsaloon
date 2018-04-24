#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import "CodePush.h"

#import "AppDelegate.h"

#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "RCTOneSignal.h"

#import "RCTLinkingManager.h"

#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>

@implementation AppDelegate

@synthesize oneSignal = _oneSignal;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
#else
  jsCodeLocation = [CodePush bundleURL];
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"gs"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];

  NSArray *objects = [[NSBundle mainBundle] loadNibNamed:@"LaunchScreen" owner:self options:nil];
  UIImageView *loadingView = [[[objects objectAtIndex:0] subviews] objectAtIndex:0];
  loadingView = [[UIImageView alloc] initWithImage:[loadingView image]];
  loadingView.frame = [UIScreen mainScreen].bounds;

  rootView.loadingView = loadingView;

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [[UIViewController alloc] init];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];

  NSDictionary * settings = @{kOSSettingsKeyAutoPrompt : @NO};
  self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions
                                                         appId:[[NSBundle mainBundle].infoDictionary valueForKey:@"OneSignalAppId"]
                                                      settings:settings];
  
  [Fabric with:@[[Crashlytics class]]];

  return YES;
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}

// For deep linking
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  BOOL handled = [[FBSDKApplicationDelegate sharedInstance] application:application
                                                                openURL:url
                                                      sourceApplication:sourceApplication
                                                             annotation:annotation
                  ];
  
  // Add any custom logic here.
  if (!handled) {
    handled = [RCTLinkingManager application:application openURL:url
                           sourceApplication:sourceApplication annotation:annotation];
  }
  
  return handled;
}

// Only if your app is using [Universal Links](https://developer.apple.com/library/ios/documentation/General/Conceptual/AppSearch/UniversalLinks.html)
//- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
// restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
//{
//  return [RCTLinkingManager application:application
//                   continueUserActivity:userActivity
//                     restorationHandler:restorationHandler];
//}

@end
