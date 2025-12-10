# Dad Flip Feature 🔄

The **Dad Flip** is a fun power dynamic feature that lets dad reverse his aura score, but with limits controlled by his son!

## How It Works

### The Power
- Dad can **flip** his aura total from negative to positive (or vice versa)
- Example: If aura is `-200`, dad can flip it to `+200`
- Example: If aura is `+150`, dad can flip it to `-150`

### The Catch
- **Son controls the limits!** 
- Default: Dad gets **2 flips per day**
- Son can increase or decrease this limit (0-10 flips)
- Flips reset daily at midnight

### The Game
1. **Dad at -200** → Dad flips → **+200**
2. **Son adds -50** → Now at **-250** (son can still add/remove points)
3. **Dad flips again** → **+250** (uses flip #2, max for today)
4. **No more flips today!** Dad must wait until tomorrow

## For Dad 🧔

### Using Your Flip Power

1. Open the dashboard
2. Look for the **🔄 Dad Flip Power** section
3. See your current total and what it would flip to
4. Click **"🔄 Flip Now"** if you have flips remaining
5. Watch your aura reverse instantly!

### Flip Status
- **Flips Remaining:** Shows how many flips you have left today
- **Used/Max:** Shows flips used out of total allowed (e.g., "1/2 used")
- **Disabled:** Button grays out when no flips remain

### Strategy Tips
- 💡 Save flips for when aura is very negative
- 💡 Use early if you're positive and son is on a rampage
- 💡 Flips reset at midnight - don't waste them!

## For Son 👦

### Controlling Dad's Power

1. Open the dashboard
2. Find **⚙️ Son's Control Panel** (click to expand)
3. Use the slider to set max flips per day (0-10)
4. Click **"Save Changes"**
5. Dad's flip limit updates immediately!

### Power Levels
- **0 flips:** 😈 Dad has NO flip power!
- **1 flip:** 😏 Dad gets 1 flip per day
- **2 flips:** 😊 Dad gets 2 flips per day (default)
- **3-5 flips:** 😇 Dad gets some extra flips
- **6-10 flips:** 🤯 Dad has UNLIMITED power!

### Strategy Tips
- 💡 Lower the limit when dad is behaving badly
- 💡 Raise the limit as a reward for good behavior
- 💡 Set to 0 to completely disable dad's flip power
- 💡 You can change the limit anytime!

## Activity Feed

Flip events show up in the activity feed with special styling:
- **🔄 Purple gradient background**
- **"DAD FLIP!" label** instead of points
- **Shows the flip:** "Dad used a flip! -200 → +200"
- **Special badge:** "dad flip" instead of source

## Technical Details

### Database
- `dad_flips` table tracks all flip events
- `flip_config` table stores the max flips per day setting
- Flip events also create aura events (🔄 emoji)

### API Endpoints
- `GET /api/flip` - Get flip status (can dad flip today?)
- `POST /api/flip` - Perform a flip
- `GET /api/flip-config` - Get flip configuration
- `PUT /api/flip-config` - Update flip configuration (son only)

### Real-Time Updates
- Dashboard updates instantly when dad flips
- Son sees flip events appear in real-time
- Flip counter updates automatically

## Examples

### Scenario 1: Dad's Comeback
1. **Morning:** Dad's aura is `-150` (rough night)
2. **Dad flips:** Now at `+150` (flip #1)
3. **Son adds -20:** Now at `+130` (son still controls points)
4. **Afternoon:** Son adds -200 (bad dad moment)
5. **Dad at -70:** Dad flips again → `+70` (flip #2, max reached)
6. **Evening:** Dad can't flip anymore, must earn points the hard way!

### Scenario 2: Son's Revenge
1. **Dad at +200:** Feeling good!
2. **Son lowers flip limit to 0:** Dad loses flip power
3. **Son adds -300:** Dad now at `-100`
4. **Dad can't flip:** Must wait for son to restore flip power
5. **Next day:** Son raises limit to 1, dad gets 1 flip back

### Scenario 3: The Generous Son
1. **Son sets flip limit to 10:** Dad has lots of power
2. **Dad flips multiple times throughout the day**
3. **Son realizes dad is abusing the power**
4. **Son lowers limit back to 2:** Balance restored!

## FAQ

**Q: Can son flip dad's aura?**  
A: No, only dad can flip. Son controls the limits and adds/removes points.

**Q: What happens at midnight?**  
A: Flip counter resets. Dad gets his full flip allowance back.

**Q: Can dad flip when aura is 0?**  
A: Yes, but 0 flipped is still 0, so it's pointless!

**Q: Do flips cost aura points?**  
A: No, flips are free. They just reverse the total.

**Q: Can son see when dad flips?**  
A: Yes! Flip events appear in the activity feed in real-time.

**Q: What if son changes the limit mid-day?**  
A: The new limit applies immediately. If dad already used more flips than the new limit, he can't flip anymore today.

---

**The flip feature adds a fun power dynamic and strategy element to the aura game!** 🎮


